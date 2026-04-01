<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static ?string $navigationGroup = 'Products';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('General')
                    ->schema([
                        Forms\Components\TextInput::make('title_az')
                            ->label('Title (AZ)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_en')
                            ->label('Title (EN)')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state))),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('sku')
                            ->label('SKU')
                            ->maxLength(255),
                        Forms\Components\Select::make('category_id')
                            ->label('Category')
                            ->relationship('category', 'name_en')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('stock_status')
                            ->options([
                                'in_stock' => 'In Stock',
                                'by_order' => 'By Order',
                            ])
                            ->required()
                            ->default('in_stock'),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                        Forms\Components\Toggle::make('is_featured')
                            ->label('Featured')
                            ->default(false),
                        Forms\Components\Toggle::make('is_hot_sale')
                            ->label('Hot Sale')
                            ->default(false),
                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Pricing')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->numeric()
                            ->prefix('AZN')
                            ->required(),
                        Forms\Components\TextInput::make('old_price')
                            ->label('Old Price (for discount)')
                            ->numeric()
                            ->prefix('AZN')
                            ->nullable(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Content (AZ)')
                    ->schema([
                        Forms\Components\Textarea::make('short_description_az')
                            ->label('Short Description (AZ)')
                            ->rows(3),
                        Forms\Components\RichEditor::make('description_az')
                            ->label('Description (AZ)')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Content (EN)')
                    ->schema([
                        Forms\Components\Textarea::make('short_description_en')
                            ->label('Short Description (EN)')
                            ->rows(3),
                        Forms\Components\RichEditor::make('description_en')
                            ->label('Description (EN)')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Images')
                    ->schema([
                        Forms\Components\Repeater::make('images')
                            ->relationship()
                            ->schema([
                                Forms\Components\FileUpload::make('image_path')
                                    ->label('Image')
                                    ->disk('public')
                                    ->directory('products')
                                    ->image()
                                    ->required(),
                                Forms\Components\TextInput::make('alt_text')
                                    ->label('Alt Text')
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('sort_order')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(3)
                            ->orderable('sort_order')
                            ->defaultItems(0)
                            ->collapsible()
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Vehicle Compatibility')
                    ->schema([
                        Forms\Components\Repeater::make('compatibilities')
                            ->relationship()
                            ->schema([
                                Forms\Components\Select::make('vehicle_brand_id')
                                    ->label('Brand')
                                    ->options(VehicleBrand::pluck('name', 'id'))
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(fn (Set $set) => $set('vehicle_model_id', null)),
                                Forms\Components\Select::make('vehicle_model_id')
                                    ->label('Model')
                                    ->options(function (Get $get) {
                                        $brandId = $get('vehicle_brand_id');
                                        if (! $brandId) {
                                            return [];
                                        }

                                        return VehicleModel::where('vehicle_brand_id', $brandId)
                                            ->pluck('name', 'id');
                                    })
                                    ->searchable()
                                    ->preload()
                                    ->nullable(),
                                Forms\Components\TextInput::make('notes')
                                    ->maxLength(255),
                            ])
                            ->columns(3)
                            ->defaultItems(0)
                            ->collapsible()
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('SEO')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title_az')
                            ->label('Meta Title (AZ)')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('meta_title_en')
                            ->label('Meta Title (EN)')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('meta_description_az')
                            ->label('Meta Description (AZ)')
                            ->rows(2),
                        Forms\Components\Textarea::make('meta_description_en')
                            ->label('Meta Description (EN)')
                            ->rows(2),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('images.image_path')
                    ->label('Image')
                    ->disk('public')
                    ->circular()
                    ->stacked()
                    ->limit(1),
                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name_en')
                    ->label('Category')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->money('AZN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('old_price')
                    ->label('Old Price')
                    ->money('AZN')
                    ->sortable()
                    ->placeholder('-'),
                Tables\Columns\BadgeColumn::make('stock_status')
                    ->colors([
                        'success' => 'in_stock',
                        'warning' => 'by_order',
                    ]),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\ToggleColumn::make('is_featured')
                    ->label('Featured'),
                Tables\Columns\ToggleColumn::make('is_hot_sale')
                    ->label('Hot Sale'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name_en')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('stock_status')
                    ->options([
                        'in_stock' => 'In Stock',
                        'by_order' => 'By Order',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured'),
                Tables\Filters\TernaryFilter::make('is_hot_sale')
                    ->label('Hot Sale'),
                Tables\Filters\Filter::make('discounted')
                    ->label('Discounted')
                    ->query(fn (Builder $query) => $query->whereNotNull('old_price')->whereColumn('old_price', '>', 'price'))
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('toggleActive')
                        ->label('Toggle Active')
                        ->icon('heroicon-o-arrow-path')
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                $record->update(['is_active' => ! $record->is_active]);
                            }
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('sort_order');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
