<?php

namespace App\Filament\Pages;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class BulkImportProducts extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-arrow-up-tray';
    protected static ?string $navigationGroup = 'Məhsullar';
    protected static ?string $navigationLabel = 'Toplu Yükləmə';
    protected static ?string $title = 'Məhsulları Toplu Yükləmə';
    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.bulk-import-products';

    public ?string $zip_file = null;
    public array $importResults = [];
    public bool $showResults = false;

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('ZIP Faylını Yüklə')
                    ->description('ZIP faylının içində products.xlsx və images/ qovluğu olmalıdır')
                    ->schema([
                        Forms\Components\FileUpload::make('zip_file')
                            ->label('ZIP Fayl')
                            ->disk('local')
                            ->directory('temp-imports')
                            ->acceptedFileTypes(['application/zip', 'application/x-zip-compressed'])
                            ->maxSize(512000)
                            ->required(),
                    ]),
            ]);
    }

    public function import(): void
    {
        $this->validate();

        if (!$this->zip_file) {
            Notification::make()->title('ZIP fayl seçilməyib')->danger()->send();
            return;
        }

        $zipPath = Storage::disk('local')->path($this->zip_file);

        if (!file_exists($zipPath)) {
            Notification::make()->title('Fayl tapılmadı')->danger()->send();
            return;
        }

        $extractDir = storage_path('app/temp-imports/extracted_' . time());

        try {
            // Extract ZIP
            $zip = new ZipArchive();
            if ($zip->open($zipPath) !== true) {
                Notification::make()->title('ZIP faylı açıla bilmədi')->danger()->send();
                return;
            }
            $zip->extractTo($extractDir);
            $zip->close();

            // Find Excel file
            $excelFile = $this->findExcelFile($extractDir);

            // Also check subdirectory (some ZIP tools create a folder)
            if (!$excelFile) {
                $dirs = glob($extractDir . '/*', GLOB_ONLYDIR);
                foreach ($dirs as $dir) {
                    $excelFile = $this->findExcelFile($dir);
                    if ($excelFile) {
                        $extractDir = $dir;
                        break;
                    }
                }
            }

            if (!$excelFile) {
                Notification::make()->title('ZIP-in içində products.xlsx tapılmadı')->danger()->send();
                return;
            }

            // Find images directory
            $imagesDir = null;
            foreach (['images', 'Images', 'img', 'photos', 'sekiller'] as $dirName) {
                $dir = $extractDir . '/' . $dirName;
                if (is_dir($dir)) {
                    $imagesDir = $dir;
                    break;
                }
            }

            // Read Excel
            $data = Excel::toArray(null, $excelFile);
            if (empty($data) || empty($data[0])) {
                Notification::make()->title('Excel faylı boşdur')->danger()->send();
                return;
            }

            $rows = $data[0];
            $headers = array_map(fn($h) => Str::slug(trim($h ?? ''), '_'), $rows[0]);
            unset($rows[0]);

            // Cache lookups
            $categories = Category::pluck('id', 'slug')->toArray();
            $categoryNames = Category::pluck('id', 'name_az')->toArray();
            $brands = VehicleBrand::pluck('id', 'name')->toArray();
            $vehicleModels = VehicleModel::all()->groupBy('vehicle_brand_id');

            $results = ['success' => 0, 'failed' => 0, 'errors' => []];

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                $rowNum = $index + 1;

                try {
                    // Map headers to values
                    $item = [];
                    foreach ($headers as $i => $header) {
                        $item[$header] = $row[$i] ?? null;
                    }

                    $title = trim($item['title'] ?? $item['title_az'] ?? $item['baslig'] ?? '');
                    if (empty($title)) {
                        $results['errors'][] = "Sətir {$rowNum}: Başlıq boşdur";
                        $results['failed']++;
                        continue;
                    }

                    // Category - try slug, then name
                    $catValue = trim($item['category'] ?? $item['category_slug'] ?? $item['kateqoriya'] ?? '');
                    $catId = $categories[$catValue] ?? $categoryNames[$catValue] ?? null;
                    if (!$catId) {
                        $results['errors'][] = "Sətir {$rowNum}: Kateqoriya tapılmadı - '{$catValue}'";
                        $results['failed']++;
                        continue;
                    }

                    $price = floatval($item['price'] ?? $item['qiymet'] ?? 0);
                    if ($price <= 0) {
                        $results['errors'][] = "Sətir {$rowNum}: Qiymət düzgün deyil";
                        $results['failed']++;
                        continue;
                    }

                    // Generate unique slug
                    $slug = Str::slug($title);
                    $baseSlug = $slug;
                    $counter = 1;
                    while (Product::where('slug', $slug)->exists()) {
                        $slug = $baseSlug . '-' . $counter++;
                    }

                    $oldPrice = !empty($item['old_price'] ?? $item['kohne_qiymet'] ?? null)
                        ? floatval($item['old_price'] ?? $item['kohne_qiymet'])
                        : null;

                    $shortDesc = $item['short_description'] ?? $item['short_description_az'] ?? $item['qisa_tesvir'] ?? null;
                    $desc = $item['description'] ?? $item['description_az'] ?? $item['tesvir'] ?? null;

                    // Create product
                    $product = Product::create([
                        'slug' => $slug,
                        'sku' => $item['sku'] ?? null,
                        'category_id' => $catId,
                        'title_az' => $title,
                        'title_en' => $title,
                        'short_description_az' => $shortDesc,
                        'short_description_en' => $shortDesc,
                        'description_az' => $desc,
                        'description_en' => $desc,
                        'price' => $price,
                        'old_price' => $oldPrice,
                        'stock_status' => $item['stock_status'] ?? 'in_stock',
                        'is_hot_sale' => (bool) ($item['is_hot_sale'] ?? $item['endirimli'] ?? false),
                        'is_featured' => (bool) ($item['is_featured'] ?? $item['secilmis'] ?? false),
                        'is_active' => true,
                        'sort_order' => intval($item['sort_order'] ?? $item['sira'] ?? 0),
                        'meta_title_az' => Str::limit($title, 60),
                        'meta_title_en' => Str::limit($title, 60),
                        'meta_description_az' => Str::limit($shortDesc ?? $desc ?? $title, 155),
                        'meta_description_en' => Str::limit($shortDesc ?? $desc ?? $title, 155),
                    ]);

                    // Handle images
                    $imageNames = $item['images'] ?? $item['sekiller'] ?? '';
                    if (!empty($imageNames) && $imagesDir) {
                        $imgList = array_map('trim', explode(',', $imageNames));
                        $sortOrder = 0;

                        foreach ($imgList as $imgName) {
                            $imgName = trim($imgName);
                            if (empty($imgName)) continue;

                            $srcPath = $this->findImageFile($imagesDir, $imgName);

                            if ($srcPath) {
                                $ext = strtolower(pathinfo($srcPath, PATHINFO_EXTENSION));
                                $storageName = 'products/' . Str::ulid() . '.' . $ext;
                                $destPath = Storage::disk('public')->path($storageName);

                                $dir = dirname($destPath);
                                if (!is_dir($dir)) {
                                    mkdir($dir, 0755, true);
                                }

                                copy($srcPath, $destPath);

                                ProductImage::create([
                                    'product_id' => $product->id,
                                    'image_path' => $storageName,
                                    'alt_text' => $title,
                                    'sort_order' => $sortOrder++,
                                ]);
                            } else {
                                $results['errors'][] = "Sətir {$rowNum}: Şəkil tapılmadı - '{$imgName}'";
                            }
                        }
                    }

                    // Handle vehicle compatibility
                    $brandNames = $item['vehicle_brands'] ?? $item['brendler'] ?? '';
                    if (!empty($brandNames)) {
                        $brandList = array_map('trim', explode(',', $brandNames));
                        $modelNames = $item['vehicle_models'] ?? $item['modeller'] ?? '';
                        $modelList = !empty($modelNames) ? array_map('trim', explode(',', $modelNames)) : [];

                        foreach ($brandList as $brandName) {
                            $brandId = $brands[$brandName] ?? null;
                            if (!$brandId) continue;

                            $brandModelCollection = $vehicleModels->get($brandId, collect());
                            $matchedModelId = null;

                            foreach ($modelList as $modelName) {
                                $found = $brandModelCollection->firstWhere('name', $modelName);
                                if ($found) {
                                    $matchedModelId = $found->id;
                                    break;
                                }
                            }

                            $product->compatibilities()->create([
                                'vehicle_brand_id' => $brandId,
                                'vehicle_model_id' => $matchedModelId,
                            ]);
                        }
                    }

                    $results['success']++;

                } catch (\Exception $e) {
                    $results['errors'][] = "Sətir {$rowNum}: " . $e->getMessage();
                    $results['failed']++;
                }
            }

            DB::commit();

            $this->importResults = $results;
            $this->showResults = true;

            // Cleanup
            $this->cleanupDir($extractDir);
            Storage::disk('local')->delete($this->zip_file);
            $this->zip_file = null;

            if ($results['success'] > 0) {
                Notification::make()
                    ->title("{$results['success']} məhsul uğurla yükləndi!")
                    ->success()
                    ->send();
            }

            if ($results['failed'] > 0) {
                Notification::make()
                    ->title("{$results['failed']} məhsul yüklənə bilmədi")
                    ->warning()
                    ->send();
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Notification::make()
                ->title('Xəta baş verdi: ' . Str::limit($e->getMessage(), 100))
                ->danger()
                ->send();
        }
    }

    public function downloadTemplate(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $path = public_path('templates/products_template.xlsx');

        return response()->download($path, 'products_template.xlsx');
    }

    private function findExcelFile(string $dir): ?string
    {
        foreach (['products.xlsx', 'products.xls', 'products.csv', 'Products.xlsx'] as $name) {
            $path = $dir . '/' . $name;
            if (file_exists($path)) {
                return $path;
            }
        }
        return null;
    }

    private function findImageFile(string $imagesDir, string $imgName): ?string
    {
        // Direct match
        $path = $imagesDir . '/' . $imgName;
        if (file_exists($path)) return $path;

        // Try different extensions
        $baseName = pathinfo($imgName, PATHINFO_FILENAME);
        foreach (['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'] as $ext) {
            $tryPath = $imagesDir . '/' . $baseName . '.' . $ext;
            if (file_exists($tryPath)) return $tryPath;
        }

        return null;
    }

    private function cleanupDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($items as $item) {
            $item->isDir() ? rmdir($item->getRealPath()) : unlink($item->getRealPath());
        }
        rmdir($dir);
    }
}
