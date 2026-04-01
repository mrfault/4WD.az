<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\GalleryItem;
use App\Models\Product;
use App\Models\ProductCompatibility;
use App\Models\ProductImage;
use App\Models\Setting;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    private function downloadImage(string $url, string $directory, string $filename): string
    {
        $path = storage_path("app/public/{$directory}");
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
        $fullPath = "{$path}/{$filename}";
        if (!file_exists($fullPath)) {
            try {
                $ctx = stream_context_create(['http' => ['timeout' => 15]]);
                $contents = @file_get_contents($url, false, $ctx);
                if ($contents !== false) {
                    file_put_contents($fullPath, $contents);
                    $this->command?->info("Downloaded: {$directory}/{$filename}");
                }
            } catch (\Exception $e) {
                $this->command?->warn("Failed: {$directory}/{$filename}");
            }
        }
        return "{$directory}/{$filename}";
    }

    public function run(): void
    {
        // ── Settings ──
        $settings = [
            'contact_phone' => '+994 50 123 45 67',
            'contact_email' => 'info@4wd.az',
            'address_az' => 'Bakı, Nərimanov rayonu, Əliyar Əliyev küç. 12',
            'address_en' => 'Baku, Narimanov district, Aliyar Aliyev str. 12',
            'working_hours_az' => 'Bazar ertəsi - Şənbə: 10:00 - 19:00',
            'working_hours_en' => 'Monday - Saturday: 10:00 - 19:00',
            'instagram_url' => 'https://instagram.com/4wd.az',
            'facebook_url' => 'https://facebook.com/4wdaz',
            'youtube_url' => 'https://youtube.com/@4wdaz',
            'whatsapp_number' => '+994501234567',
            'tiktok_url' => 'https://tiktok.com/@4wdaz',
        ];
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        $this->command?->info('Settings updated.');

        // ── Categories ──
        $catImages = [
            'photo-1533473359331-0135ef1b58bf', 'photo-1581235707960-35f13cf42a63',
            'photo-1558618666-fcd25c85f82e', 'photo-1549317661-bd32c8ce0afa',
            'photo-1536766820879-059fec98ec0a', 'photo-1568605117036-5fe5e7bab0b7',
            'photo-1519681393784-d120267933ba', 'photo-1504215680853-026ed2a45def',
            'photo-1494976388531-d1058494cdd8', 'photo-1516912481808-3406841bd33c',
        ];
        $categoriesData = [
            ['slug' => 'suspension', 'name_az' => 'Asma sistemi', 'name_en' => 'Suspension', 'description_az' => 'Peşəkar offroad asma sistemləri və amortizatorlar', 'description_en' => 'Professional offroad suspension systems and shock absorbers'],
            ['slug' => 'lift-kits', 'name_az' => 'Qaldırma dəstləri', 'name_en' => 'Lift Kits', 'description_az' => 'Avtomobilinizi yüksəldin, keçid qabiliyyətini artırın', 'description_en' => 'Lift your vehicle, increase ground clearance'],
            ['slug' => 'wheels-tires', 'name_az' => 'Təkərlər', 'name_en' => 'Wheels & Tires', 'description_az' => 'Offroad təkərləri və disklər', 'description_en' => 'Offroad tires and wheels'],
            ['slug' => 'roof-racks', 'name_az' => 'Dam baqajları', 'name_en' => 'Roof Racks', 'description_az' => 'Peşəkar dam baqaj sistemləri', 'description_en' => 'Professional roof rack systems'],
            ['slug' => 'lighting', 'name_az' => 'İşıqlandırma', 'name_en' => 'Lighting', 'description_az' => 'LED işıq barları və əlavə işıqlandırma', 'description_en' => 'LED light bars and auxiliary lighting'],
            ['slug' => 'bumpers', 'name_az' => 'Bamperlər', 'name_en' => 'Bumpers', 'description_az' => 'Gücləndirilmiş offroad bamperləri', 'description_en' => 'Heavy-duty offroad bumpers'],
            ['slug' => 'winches', 'name_az' => 'Bucurqadlar', 'name_en' => 'Winches', 'description_az' => 'Elektrik və hidravlik bucurqadlar', 'description_en' => 'Electric and hydraulic winches'],
            ['slug' => 'snorkels', 'name_az' => 'Snorkellər', 'name_en' => 'Snorkels', 'description_az' => 'Hava filtrasiya snorkelləri', 'description_en' => 'Air intake snorkels'],
            ['slug' => 'interior', 'name_az' => 'Salon aksessuarları', 'name_en' => 'Interior Accessories', 'description_az' => 'Daxili aksessuar və avadanlıqlar', 'description_en' => 'Interior accessories and equipment'],
            ['slug' => 'recovery-gear', 'name_az' => 'Xilasetmə avadanlığı', 'name_en' => 'Recovery Gear', 'description_az' => 'Xilasetmə və çıxarma avadanlıqları', 'description_en' => 'Recovery and extraction equipment'],
        ];

        $categories = [];
        foreach ($categoriesData as $i => $cat) {
            $img = $this->downloadImage(
                "https://images.unsplash.com/{$catImages[$i]}?w=800&q=80",
                'categories', "cat-{$cat['slug']}.jpg"
            );
            $categories[$cat['slug']] = Category::updateOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, [
                    'image' => $img,
                    'is_active' => true,
                    'sort_order' => $i,
                    'meta_title_az' => $cat['name_az'] . ' | 4WD.az',
                    'meta_title_en' => $cat['name_en'] . ' | 4WD.az',
                    'meta_description_az' => $cat['description_az'],
                    'meta_description_en' => $cat['description_en'],
                ])
            );
        }
        $this->command?->info('10 categories created.');

        // ── Vehicle Brands ──
        $brandsData = ['Toyota', 'Nissan', 'Mitsubishi', 'Jeep', 'Land Rover', 'Suzuki', 'Ford', 'Chevrolet'];
        $brands = [];
        foreach ($brandsData as $i => $name) {
            $brands[$name] = VehicleBrand::updateOrCreate(
                ['slug' => \Str::slug($name)],
                ['name' => $name, 'is_active' => true, 'sort_order' => $i]
            );
        }
        $this->command?->info('8 brands created.');

        // ── Vehicle Models ──
        $modelsData = [
            'Toyota' => [['Land Cruiser 200', 2008, 2021], ['Land Cruiser 300', 2021, null], ['Hilux', 2015, null], ['4Runner', 2014, null]],
            'Nissan' => [['Patrol Y61', 1997, 2010], ['Patrol Y62', 2010, null], ['Navara', 2015, null]],
            'Mitsubishi' => [['Pajero', 2006, 2021], ['L200', 2015, null]],
            'Jeep' => [['Wrangler JK', 2007, 2018], ['Wrangler JL', 2018, null], ['Grand Cherokee', 2011, null], ['Gladiator', 2020, null]],
            'Land Rover' => [['Defender', 2020, null], ['Discovery', 2017, null]],
            'Suzuki' => [['Jimny', 2018, null], ['Grand Vitara', 2015, null]],
            'Ford' => [['Ranger', 2019, null], ['Bronco', 2021, null]],
            'Chevrolet' => [['Tahoe', 2015, null], ['Silverado', 2019, null]],
        ];
        $models = [];
        foreach ($modelsData as $brandName => $brandModels) {
            foreach ($brandModels as $m) {
                $model = VehicleModel::updateOrCreate(
                    ['slug' => \Str::slug($m[0]), 'vehicle_brand_id' => $brands[$brandName]->id],
                    ['name' => $m[0], 'year_from' => $m[1], 'year_to' => $m[2], 'is_active' => true]
                );
                $models[$m[0]] = $model;
            }
        }
        $this->command?->info('Vehicle models created.');

        // ── Products ──
        $prodImages = [
            'photo-1544636331-e26879cd4d9b', 'photo-1489824904134-891ab64532f1',
            'photo-1552519507-da3b142c6e3d', 'photo-1542362567-b07e54358753',
            'photo-1486496146582-9a558f08b5d5', 'photo-1550355291-bbee04a92027',
            'photo-1494905998402-395d579af36f', 'photo-1503376780353-7e6692767b70',
            'photo-1511919884226-fd3cad34687c', 'photo-1502877338535-766e1452684a',
            'photo-1583121274602-3e2820c69888', 'photo-1514867644123-6385d58d3cd4',
            'photo-1517524008697-84bbe3c3fd98', 'photo-1580273916550-e323be2ae537',
            'photo-1605559424843-9e4c228bf1c2', 'photo-1618843479313-40f8afb4b4d8',
            'photo-1616422285623-13ff0162193c', 'photo-1612544448445-b8232cff3b6c',
            'photo-1609521263047-f8f205293f24', 'photo-1606016159991-dfe4f2746ad5',
            'photo-1619405399517-d7fce0f13302', 'photo-1563720223185-11003d516935',
            'photo-1541443131876-44b03de101c5', 'photo-1512341689157-e872962c882e',
            'photo-1551830820-330a71b99659', 'photo-1597007030739-6d2e4adf59a0',
            'photo-1601362840469-51e4d8d58785', 'photo-1590362891991-f776e747a588',
            'photo-1581993192008-63e896f4f744', 'photo-1546614042-7df3c8c9e3be',
        ];

        $productsData = [
            ['slug' => 'ome-nitrocharger-sport', 'cat' => 'suspension', 'title_az' => 'Old Man Emu Nitrocharger Sport Amortizator', 'title_en' => 'Old Man Emu Nitrocharger Sport Shock Absorber', 'short_az' => 'Peşəkar offroad amortizatoru, yüksək performans və davamlılıq.', 'short_en' => 'Professional offroad shock absorber with high performance and durability.', 'desc_az' => 'Old Man Emu Nitrocharger Sport amortizatorları Avstraliyada istehsal olunur və dünyanın ən etibarlı offroad asma komponentlərindən biridir. Nitrocharger texnologiyası sayəsində sərt yollarda belə mükəmməl idarəetmə təmin edir. Uzun ömürlü dizayn və asan quraşdırma imkanı ilə fərqlənir.', 'desc_en' => 'Old Man Emu Nitrocharger Sport shock absorbers are manufactured in Australia and are among the most reliable offroad suspension components worldwide. Thanks to Nitrocharger technology, they provide excellent handling even on rough terrain. Distinguished by long-lasting design and easy installation.', 'price' => 850, 'old_price' => null, 'stock' => 'in_stock', 'hot' => true, 'featured' => true, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Toyota', 'Land Cruiser 300']]],
            ['slug' => 'arb-sahara-bumper', 'cat' => 'bumpers', 'title_az' => 'ARB Sahara Bar Ön Bamper', 'title_en' => 'ARB Sahara Bar Front Bumper', 'short_az' => 'Tam qorumalı gücləndirilmiş polad bamper.', 'short_en' => 'Full protection heavy-duty steel bumper.', 'desc_az' => 'ARB Sahara Bar ön bamperi yüksək keyfiyyətli poladdan hazırlanıb və maksimum qorunma təmin edir. Bucurqad quraşdırma yeri, əlavə işıq montaj nöqtələri və yüksək açılı yanaşma bucağı ilə təchiz olunub. Hər bir bamper kompüter idarəli kəsmə texnologiyası ilə hazırlanır.', 'desc_en' => 'The ARB Sahara Bar front bumper is made from high-quality steel providing maximum protection. Equipped with winch mounting point, auxiliary light mounting positions, and improved approach angle. Each bumper is manufactured using computer-controlled cutting technology.', 'price' => 2800, 'old_price' => 3200, 'stock' => 'in_stock', 'hot' => true, 'featured' => true, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Nissan', 'Patrol Y62']]],
            ['slug' => 'warn-zeon-10s', 'cat' => 'winches', 'title_az' => 'Warn Zeon 10-S Sintetik Kəndir Bucurqad', 'title_en' => 'Warn Zeon 10-S Synthetic Rope Winch', 'short_az' => '10,000 lbs güclü bucurqad, sintetik kəndirlə.', 'short_en' => '10,000 lbs powerful winch with synthetic rope.', 'desc_az' => 'Warn Zeon 10-S bucurqadı 10,000 lbs dartma gücünə malikdir. Sintetik kəndir daha yüngül və təhlükəsizdir. IP68 su keçirməzlik standartına cavab verir. Ağır şəraitlərdə belə etibarlı xilasetmə təmin edir.', 'desc_en' => 'The Warn Zeon 10-S winch has a pulling capacity of 10,000 lbs. Synthetic rope is lighter and safer. Meets IP68 waterproof standard. Provides reliable recovery even in extreme conditions.', 'price' => 3200, 'old_price' => null, 'stock' => 'by_order', 'hot' => true, 'featured' => false, 'compat' => [['Jeep', 'Wrangler JL'], ['Toyota', 'Land Cruiser 200']]],
            ['slug' => 'bfg-ko2-265', 'cat' => 'wheels-tires', 'title_az' => 'BFGoodrich All-Terrain KO2 265/70R17', 'title_en' => 'BFGoodrich All-Terrain KO2 265/70R17', 'short_az' => 'Ən populyar offroad təkəri, asfalt və çöldə mükəmməl.', 'short_en' => 'Most popular offroad tire, excellent on and off road.', 'desc_az' => 'BFGoodrich KO2 dünyanın ən çox satılan all-terrain təkəridir. CoreGard texnologiyası ilə yan divar zədələrinə qarşı gücləndirilmiş qorunma təmin edir. Palçıq, qum və qayalıq səthlərdə mükəmməl çəkiş qabiliyyəti göstərir.', 'desc_en' => 'The BFGoodrich KO2 is the world\'s best-selling all-terrain tire. CoreGard technology provides enhanced protection against sidewall damage. Excellent traction on mud, sand, and rocky surfaces.', 'price' => 450, 'old_price' => 520, 'stock' => 'in_stock', 'hot' => true, 'featured' => true, 'compat' => [['Toyota', 'Hilux'], ['Nissan', 'Navara'], ['Ford', 'Ranger']]],
            ['slug' => 'safari-snorkel-lc200', 'cat' => 'snorkels', 'title_az' => 'Safari Snorkel Toyota LC200 üçün', 'title_en' => 'Safari Snorkel for Toyota Land Cruiser 200', 'short_az' => 'Təmiz hava təminatı, su keçidlərində qorunma.', 'short_en' => 'Clean air supply, protection during water crossings.', 'desc_az' => 'Safari Snorkel Avstraliyada istehsal olunur. Dam səviyyəsindən təmiz hava alaraq mühərrikin ömrünü uzadır. Su keçidlərində mühərriki qoruyur. UV-davamlı polietilendən hazırlanıb.', 'desc_en' => 'Safari Snorkel is manufactured in Australia. Takes clean air from roof level extending engine life. Protects the engine during water crossings. Made from UV-resistant polyethylene.', 'price' => 650, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Land Cruiser 200']]],
            ['slug' => 'lightforce-genesis-led', 'cat' => 'lighting', 'title_az' => 'Lightforce Genesis 21" LED İşıq Barı', 'title_en' => 'Lightforce Genesis 21" LED Light Bar', 'short_az' => 'Güclü LED işıqlandırma, gecə sürüşü üçün ideal.', 'short_en' => 'Powerful LED lighting, ideal for night driving.', 'desc_az' => 'Lightforce Genesis LED işıq barı 21,000 lümen parlaqlıq təmin edir. Combo şüa naxışı uzaq və yaxın məsafəni əhatə edir. IP69K su və toz keçirməzlik. Alüminium korpus mükəmməl istilik idarəetməsi təmin edir.', 'desc_en' => 'Lightforce Genesis LED light bar provides 21,000 lumens of brightness. Combo beam pattern covers long and short range. IP69K water and dust resistance. Aluminum housing provides excellent heat management.', 'price' => 1200, 'old_price' => 1450, 'stock' => 'in_stock', 'hot' => true, 'featured' => false, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Jeep', 'Wrangler JL'], ['Ford', 'Bronco']]],
            ['slug' => 'rhino-rack-pioneer', 'cat' => 'roof-racks', 'title_az' => 'Rhino Rack Pioneer Platform Dam Baqajı', 'title_en' => 'Rhino Rack Pioneer Platform Roof Rack', 'short_az' => 'Modular dam baqaj sistemi, 100 kq yük tutumu.', 'short_en' => 'Modular roof rack system, 100kg load capacity.', 'desc_az' => 'Rhino Rack Pioneer Platform tam alüminium dam baqaj sistemidir. 100 kq dinamik yük tutumu ilə əlavə avadanlıq, çadır və ya əşyaları daşıya bilərsiniz. T-slot dizaynı müxtəlif aksessuarların əlavəsini asanlaşdırır.', 'desc_en' => 'Rhino Rack Pioneer Platform is a full aluminum roof rack system. With 100kg dynamic load capacity, you can carry additional equipment, tents, or gear. T-slot design makes it easy to add various accessories.', 'price' => 1800, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => true, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Land Rover', 'Defender']]],
            ['slug' => 'maxtrax-mkii', 'cat' => 'recovery-gear', 'title_az' => 'MAXTRAX MKII Xilasetmə Taxtaları (cüt)', 'title_en' => 'MAXTRAX MKII Recovery Boards (pair)', 'short_az' => 'Qumda və palçıqda batdıqda ən etibarlı xilasetmə vasitəsi.', 'short_en' => 'Most reliable recovery tool when stuck in sand or mud.', 'desc_az' => 'MAXTRAX MKII xilasetmə taxtaları yüksək keyfiyyətli naylondan hazırlanıb. Xüsusi diş dizaynı maksimum çəkiş təmin edir. 4,3 kq çəki ilə daşıması asandır. Qum, palçıq və qarda istifadə üçün idealdır.', 'desc_en' => 'MAXTRAX MKII recovery boards are made from high-quality nylon. Special tooth design provides maximum traction. Easy to carry at just 4.3kg. Ideal for use in sand, mud, and snow.', 'price' => 380, 'old_price' => 450, 'stock' => 'in_stock', 'hot' => true, 'featured' => false, 'compat' => []],
            ['slug' => 'ironman-2inch-lift', 'cat' => 'lift-kits', 'title_az' => 'Ironman 4x4 2" Lift Kit Toyota LC200', 'title_en' => 'Ironman 4x4 2" Lift Kit for Toyota LC200', 'short_az' => '2 düym qaldırma dəsti, tam komponent.', 'short_en' => '2-inch lift kit, complete component set.', 'desc_az' => 'Ironman 4x4 2 düym lift kit ön və arxa amortizatorlar, yaylar və bütün lazımi montaj avadanlıqlarını əhatə edir. Zavodun keyfiyyət standartlarına uyğun hazırlanıb. Yer təmizliyini artıraraq daha böyük təkərlərin quraşdırılmasına imkan verir.', 'desc_en' => 'Ironman 4x4 2-inch lift kit includes front and rear shocks, springs, and all necessary mounting hardware. Manufactured to factory quality standards. Increases ground clearance allowing installation of larger tires.', 'price' => 1600, 'old_price' => 1900, 'stock' => 'in_stock', 'hot' => false, 'featured' => true, 'compat' => [['Toyota', 'Land Cruiser 200']]],
            ['slug' => 'weathertech-floor-liners', 'cat' => 'interior', 'title_az' => 'WeatherTech Döşəmə Örtükləri', 'title_en' => 'WeatherTech Floor Liners', 'short_az' => 'Tam uyğun lazer ölçülü döşəmə örtükləri.', 'short_en' => 'Custom-fit laser measured floor liners.', 'desc_az' => 'WeatherTech döşəmə örtükləri hər avtomobilin daxili ölçülərinə uyğun lazer texnologiyası ilə hazırlanır. Su, palçıq və kirdən tam qorunma təmin edir. Asanlıqla çıxarılıb yuyula bilər.', 'desc_en' => 'WeatherTech floor liners are manufactured using laser technology matched to each vehicle\'s interior dimensions. Provides complete protection from water, mud, and dirt. Easily removable and washable.', 'price' => 280, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Toyota', 'Land Cruiser 300']]],
            ['slug' => 'arb-twin-compressor', 'cat' => 'recovery-gear', 'title_az' => 'ARB İkili Hava Kompressoru', 'title_en' => 'ARB Twin Air Compressor', 'short_az' => 'Yüksək performanslı portativ kompressor.', 'short_en' => 'High-performance portable compressor.', 'desc_az' => 'ARB ikili kompressor yüksək həcmli hava axını ilə təkərləri tez bir zamanda şişirir. Hava yastıqları, offroad alətləri və digər pnevmatik avadanlıqları işə sala bilir.', 'desc_en' => 'ARB twin compressor inflates tires quickly with high-volume airflow. Can power air lockers, offroad tools, and other pneumatic equipment.', 'price' => 750, 'old_price' => 890, 'stock' => 'in_stock', 'hot' => true, 'featured' => false, 'compat' => []],
            ['slug' => 'method-race-wheels-305', 'cat' => 'wheels-tires', 'title_az' => 'Method Race Wheels 305 NV 17x8.5', 'title_en' => 'Method Race Wheels 305 NV 17x8.5', 'short_az' => 'Peşəkar offroad diski, möhkəm və yüngül.', 'short_en' => 'Professional offroad wheel, strong and lightweight.', 'desc_az' => 'Method Race Wheels 305 NV seriyası yarış texnologiyası ilə offroad davamlılığını birləşdirir. Döymə alüminiumdan hazırlanmış bu disklər yüngül və möhkəmdir.', 'desc_en' => 'Method Race Wheels 305 NV series combines racing technology with offroad durability. Forged from aluminum, these wheels are lightweight yet strong.', 'price' => 680, 'old_price' => null, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Hilux'], ['Ford', 'Ranger']]],
            ['slug' => 'arb-fridge-47l', 'cat' => 'interior', 'title_az' => 'ARB 47L Portativ Soyuducu', 'title_en' => 'ARB 47L Portable Fridge Freezer', 'short_az' => '47 litr tutumlu offroad soyuducusu.', 'short_en' => '47-liter offroad fridge freezer.', 'desc_az' => 'ARB 47 litr portativ soyuducu uzun offroad səyahətləri üçün idealdır. -18°C-yə qədər soyutma imkanı, aşağı enerji istehlakı və möhkəm dizayn.', 'desc_en' => 'The ARB 47L portable fridge freezer is ideal for long offroad trips. Cooling capability down to -18°C, low energy consumption, and robust design.', 'price' => 1950, 'old_price' => 2300, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'rigid-360-sr', 'cat' => 'lighting', 'title_az' => 'Rigid 360-Series SR 20" LED Bar', 'title_en' => 'Rigid 360-Series SR 20" LED Light Bar', 'short_az' => 'Premium LED işıq barı, maksimum parlaqlıq.', 'short_en' => 'Premium LED light bar, maximum brightness.', 'desc_az' => 'Rigid 360-Series SR seriyası sənayenin ən parlaq LED işıq barlarından biridir. Patentli optika ilə uzaq məsafə aydınlatması. Mükəmməl istiliyə davamlı alüminium korpus.', 'desc_en' => 'The Rigid 360-Series SR is one of the brightest LED light bars in the industry. Long-range illumination with patented optics. Excellent heat-resistant aluminum housing.', 'price' => 1650, 'old_price' => null, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => [['Jeep', 'Wrangler JL'], ['Ford', 'Bronco']]],
            ['slug' => 'smittybilt-xrc-bumper', 'cat' => 'bumpers', 'title_az' => 'Smittybilt XRC Arxa Bamper', 'title_en' => 'Smittybilt XRC Rear Bumper', 'short_az' => 'Gücləndirilmiş arxa bamper, çəkmə kancası ilə.', 'short_en' => 'Heavy-duty rear bumper with tow hitch.', 'desc_az' => 'Smittybilt XRC arxa bamperi 3mm polad plitədən hazırlanıb. D-halqa montaj nöqtələri, LED işıq yuvası və çəkmə kancası əhatə edir. Qara toz örtüyü ilə korroziyaya davamlıdır.', 'desc_en' => 'Smittybilt XRC rear bumper is constructed from 3mm steel plate. Includes D-ring mounting points, LED light recesses, and tow hitch receiver. Corrosion resistant with black powder coat.', 'price' => 1400, 'old_price' => 1700, 'stock' => 'in_stock', 'hot' => true, 'featured' => false, 'compat' => [['Jeep', 'Wrangler JK'], ['Jeep', 'Wrangler JL']]],
            ['slug' => 'dobinsons-coil-springs', 'cat' => 'suspension', 'title_az' => 'Dobinsons Yay Dəsti (Ön+Arxa)', 'title_en' => 'Dobinsons Coil Spring Set (Front+Rear)', 'short_az' => 'Gücləndirilmiş yaylar, 40mm qaldırma.', 'short_en' => 'Heavy-duty springs, 40mm lift.', 'desc_az' => 'Dobinsons yayları Koreya poladından hazırlanır. 40mm qaldırma ilə yol keçid qabiliyyətini artırır. Ağır yükləmələr üçün nəzərdə tutulub.', 'desc_en' => 'Dobinsons springs are made from Korean steel. 40mm lift increases ground clearance. Designed for heavy loads.', 'price' => 520, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Nissan', 'Patrol Y61'], ['Nissan', 'Patrol Y62']]],
            ['slug' => 'arb-roof-tent', 'cat' => 'roof-racks', 'title_az' => 'ARB Simpson III Dam Çadırı', 'title_en' => 'ARB Simpson III Rooftop Tent', 'short_az' => 'Premium dam çadırı, 2 nəfərlik.', 'short_en' => 'Premium rooftop tent, sleeps 2.', 'desc_az' => 'ARB Simpson III dam çadırı offroad səyahətlərində rahat yatmaq üçün idealdır. Sukeçirməz material, güclü alüminium çərçivə və 65mm yüksək sıxlıqlı döşək daxildir.', 'desc_en' => 'ARB Simpson III rooftop tent is ideal for comfortable sleeping during offroad trips. Includes waterproof material, strong aluminum frame, and 65mm high-density mattress.', 'price' => 2400, 'old_price' => 2800, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'factor-55-ultrahook', 'cat' => 'recovery-gear', 'title_az' => 'Factor 55 UltraHook Xilasetmə Kancası', 'title_en' => 'Factor 55 UltraHook Recovery Hook', 'short_az' => 'Yüngül və güclü xilasetmə kancası.', 'short_en' => 'Lightweight and strong recovery hook.', 'desc_az' => 'Factor 55 UltraHook ənənəvi kancaları əvəz edən innovativ dizayna malikdir. 6061-T6 alüminiumdan CNC ilə hazırlanıb. 19,600 lbs yük tutumu.', 'desc_en' => 'Factor 55 UltraHook features an innovative design replacing traditional hooks. CNC machined from 6061-T6 aluminum. 19,600 lbs load capacity.', 'price' => 180, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'nitto-trail-grappler', 'cat' => 'wheels-tires', 'title_az' => 'Nitto Trail Grappler M/T 285/70R17', 'title_en' => 'Nitto Trail Grappler M/T 285/70R17', 'short_az' => 'Agressiv palçıq təkəri, yolda da rahat.', 'short_en' => 'Aggressive mud tire, comfortable on road too.', 'desc_az' => 'Nitto Trail Grappler M/T palçıq təkərləri arasında ən az səs-küy yaradan modeldir. Agressiv protector dizaynı ilə palçıqda mükəmməl çəkiş təmin edir.', 'desc_en' => 'Nitto Trail Grappler M/T produces the least noise among mud tires. Aggressive tread design provides excellent traction in mud.', 'price' => 520, 'old_price' => 580, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Jeep', 'Gladiator']]],
            ['slug' => 'comeup-seal-gen2-9500', 'cat' => 'winches', 'title_az' => 'ComeUp Seal Gen2 9.5rs Bucurqad', 'title_en' => 'ComeUp Seal Gen2 9.5rs Winch', 'short_az' => '9,500 lbs, IP68 su keçirməz.', 'short_en' => '9,500 lbs, IP68 waterproof.', 'desc_az' => 'ComeUp Seal Gen2 tam su keçirməz bucurqaddır. IP68 sertifikatlı, su altında belə işləyə bilir. 9,500 lbs dartma gücü.', 'desc_en' => 'ComeUp Seal Gen2 is a fully waterproof winch. IP68 certified, can operate even underwater. 9,500 lbs pulling capacity.', 'price' => 1900, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Hilux'], ['Nissan', 'Navara']]],
            ['slug' => 'snorkel-jimny', 'cat' => 'snorkels', 'title_az' => 'Suzuki Jimny üçün Snorkel', 'title_en' => 'Snorkel for Suzuki Jimny', 'short_az' => 'Jimny üçün xüsusi uyğunlaşdırılmış snorkel.', 'short_en' => 'Custom-fit snorkel for Jimny.', 'desc_az' => 'Suzuki Jimny JB74 üçün xüsusi hazırlanmış snorkel. LLDPE materialdan, UV davamlı. Asan quraşdırma ilə mühərriki su keçidlərindən qoruyur.', 'desc_en' => 'Specially designed snorkel for Suzuki Jimny JB74. Made from LLDPE material, UV resistant. Easy installation protects engine during water crossings.', 'price' => 420, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Suzuki', 'Jimny']]],
            ['slug' => 'front-runner-slimline', 'cat' => 'roof-racks', 'title_az' => 'Front Runner Slimline II Dam Baqajı', 'title_en' => 'Front Runner Slimline II Roof Rack', 'short_az' => 'İncə profilli modular dam baqajı.', 'short_en' => 'Low-profile modular roof rack.', 'desc_az' => 'Front Runner Slimline II modular dam baqaj sistemi minimum hava müqaviməti üçün aerodinamik dizayna malikdir. 50-dən çox aksessuar dəstəkləyir.', 'desc_en' => 'Front Runner Slimline II modular roof rack system features aerodynamic design for minimal wind resistance. Supports over 50 accessories.', 'price' => 1500, 'old_price' => 1750, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Land Rover', 'Defender'], ['Toyota', '4Runner']]],
            ['slug' => 'hella-500ff', 'cat' => 'lighting', 'title_az' => 'Hella 500FF Əlavə İşıq Dəsti', 'title_en' => 'Hella 500FF Auxiliary Light Kit', 'short_az' => 'Klassik yuvarlaq əlavə işıqlar, cüt.', 'short_en' => 'Classic round auxiliary lights, pair.', 'desc_az' => 'Hella 500FF əlavə işıq dəsti offroad klassikidir. Güclü halogen lampalar ilə uzaq məsafəni aydınladır. E-sertifikatlı, yol istifadəsinə uyğun.', 'desc_en' => 'Hella 500FF auxiliary light kit is an offroad classic. Powerful halogen lamps illuminate long distances. E-certified, suitable for road use.', 'price' => 340, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'arb-air-locker', 'cat' => 'suspension', 'title_az' => 'ARB Air Locker Diferensial Kilidi', 'title_en' => 'ARB Air Locker Differential Lock', 'short_az' => 'Pnevmatik diferensial kilidi, tam çəkiş.', 'short_en' => 'Pneumatic differential lock, full traction.', 'desc_az' => 'ARB Air Locker düymə basaraq aktivləşdirilən pnevmatik diferensial kilididir. Tam 100% çəkiş bölgüsü təmin edir. Hər iki təkər eyni sürətlə fırlanır.', 'desc_en' => 'ARB Air Locker is a button-activated pneumatic differential lock. Provides full 100% traction distribution. Both wheels spin at the same speed.', 'price' => 2100, 'old_price' => null, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', 'Land Cruiser 200'], ['Nissan', 'Patrol Y61']]],
            ['slug' => 'snatch-strap-11t', 'cat' => 'recovery-gear', 'title_az' => 'ARB 11T Xilasetmə Kəndiri', 'title_en' => 'ARB 11T Snatch Strap', 'short_az' => '11 ton dartma gücü, elastik xilasetmə kəndiri.', 'short_en' => '11-ton rated elastic recovery strap.', 'desc_az' => 'ARB 11 ton xilasetmə kəndiri elastik nayolndan hazırlanıb. Enerjini toplayaraq batmış avtomobili çıxarmaq üçün istifadə olunur. 9m uzunluq.', 'desc_en' => 'ARB 11-ton snatch strap is made from elastic nylon. Used for vehicle recovery by storing kinetic energy. 9m length.', 'price' => 120, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'bilstein-5100', 'cat' => 'suspension', 'title_az' => 'Bilstein 5100 Amortizator Dəsti', 'title_en' => 'Bilstein 5100 Shock Absorber Set', 'short_az' => 'Alman keyfiyyətli monotube amortizator.', 'short_en' => 'German-quality monotube shock absorber.', 'desc_az' => 'Bilstein 5100 seriyası monotube dizaynı ilə stabil idarəetmə təmin edir. Digər sahənin amortizatorlarla müqayisədə daha az istilik yaradır. Ömürlük zəmanət.', 'desc_en' => 'Bilstein 5100 series provides stable handling with monotube design. Generates less heat compared to twin-tube shock absorbers. Lifetime warranty.', 'price' => 950, 'old_price' => 1100, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => [['Toyota', '4Runner'], ['Chevrolet', 'Tahoe']]],
            ['slug' => 'safari-snorkel-wrangler', 'cat' => 'snorkels', 'title_az' => 'Safari Snorkel Jeep Wrangler JL', 'title_en' => 'Safari Snorkel for Jeep Wrangler JL', 'short_az' => 'Wrangler JL üçün OEM keyfiyyətli snorkel.', 'short_en' => 'OEM quality snorkel for Wrangler JL.', 'desc_az' => 'Safari Snorkel Jeep Wrangler JL üçün mükəmməl uyğunlaşdırılıb. Polietilen material uzun ömürlü istifadə təmin edir. Su keçidi zamanı mühərriki qoruyur.', 'desc_en' => 'Safari Snorkel is perfectly fitted for Jeep Wrangler JL. Polyethylene material ensures long-lasting use. Protects engine during water crossings.', 'price' => 580, 'old_price' => null, 'stock' => 'by_order', 'hot' => false, 'featured' => false, 'compat' => [['Jeep', 'Wrangler JL']]],
            ['slug' => 'tred-pro-boards', 'cat' => 'recovery-gear', 'title_az' => 'TRED Pro Xilasetmə Taxtaları', 'title_en' => 'TRED Pro Recovery Boards', 'short_az' => 'Ultra güclü xilasetmə taxtaları.', 'short_en' => 'Ultra-strong recovery boards.', 'desc_az' => 'TRED Pro xilasetmə taxtaları ən ağır şəraitlər üçün nəzərdə tutulub. Metallokeramik kompozit materialdan hazırlanıb. 4000 kq yük tutumu.', 'desc_en' => 'TRED Pro recovery boards are designed for the toughest conditions. Made from metalloceramic composite material. 4000kg load capacity.', 'price' => 550, 'old_price' => 650, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => []],
            ['slug' => 'ironman-led-pod', 'cat' => 'lighting', 'title_az' => 'Ironman 4x4 LED Pod İşıqlar (cüt)', 'title_en' => 'Ironman 4x4 LED Pod Lights (pair)', 'short_az' => 'Kompakt LED işıqlar, çoxməqsədli.', 'short_en' => 'Compact LED lights, multi-purpose.', 'desc_az' => 'Ironman 4x4 LED pod işıqları bamperə, dam baqajına və ya A-sütununa quraşdırıla bilər. 6,000 lümen parlaqlıq, IP68 su keçirməzlik.', 'desc_en' => 'Ironman 4x4 LED pod lights can be mounted on bumper, roof rack, or A-pillar. 6,000 lumens brightness, IP68 waterproof.', 'price' => 290, 'old_price' => null, 'stock' => 'in_stock', 'hot' => false, 'featured' => false, 'compat' => []],
        ];

        foreach ($productsData as $i => $p) {
            $imgPath = $this->downloadImage(
                "https://images.unsplash.com/{$prodImages[$i]}?w=600&q=80",
                'products', "product-{$p['slug']}.jpg"
            );

            $product = Product::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'category_id' => $categories[$p['cat']]->id,
                    'title_az' => $p['title_az'],
                    'title_en' => $p['title_en'],
                    'short_description_az' => $p['short_az'],
                    'short_description_en' => $p['short_en'],
                    'description_az' => $p['desc_az'],
                    'description_en' => $p['desc_en'],
                    'price' => $p['price'],
                    'old_price' => $p['old_price'],
                    'stock_status' => $p['stock'],
                    'is_hot_sale' => $p['hot'],
                    'is_featured' => $p['featured'],
                    'is_active' => true,
                    'sort_order' => $i,
                    'meta_title_az' => $p['title_az'] . ' | 4WD.az',
                    'meta_title_en' => $p['title_en'] . ' | 4WD.az',
                    'meta_description_az' => $p['short_az'],
                    'meta_description_en' => $p['short_en'],
                ]
            );

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'sort_order' => 0],
                ['image_path' => $imgPath, 'alt_text' => $p['title_en']]
            );

            foreach ($p['compat'] as $c) {
                $brand = $brands[$c[0]] ?? null;
                $model = $models[$c[1]] ?? null;
                if ($brand) {
                    ProductCompatibility::updateOrCreate([
                        'product_id' => $product->id,
                        'vehicle_brand_id' => $brand->id,
                        'vehicle_model_id' => $model?->id,
                    ]);
                }
            }
        }
        $this->command?->info('30 products created with images and compatibility.');

        // ── Gallery Items ──
        $galleryImages = [
            'photo-1533473359331-0135ef1b58bf', 'photo-1519681393784-d120267933ba',
            'photo-1504215680853-026ed2a45def', 'photo-1581235707960-35f13cf42a63',
            'photo-1568605117036-5fe5e7bab0b7', 'photo-1536766820879-059fec98ec0a',
            'photo-1549317661-bd32c8ce0afa', 'photo-1558618666-fcd25c85f82e',
            'photo-1544636331-e26879cd4d9b', 'photo-1489824904134-891ab64532f1',
            'photo-1552519507-da3b142c6e3d', 'photo-1542362567-b07e54358753',
        ];
        $galleryData = [
            ['title_az' => 'Toyota Land Cruiser 200 Tam Tuninq', 'title_en' => 'Toyota Land Cruiser 200 Full Build', 'desc_az' => 'Suspension, bamper, işıqlandırma və dam baqajı ilə tam hazırlanmış LC200.', 'desc_en' => 'Fully equipped LC200 with suspension, bumper, lighting, and roof rack.', 'brand' => 'Toyota', 'model' => 'Land Cruiser 200', 'featured' => true],
            ['title_az' => 'Jeep Wrangler JL Offroad Hazırlığı', 'title_en' => 'Jeep Wrangler JL Offroad Prep', 'desc_az' => 'Lift kit, təkər və bamper yeniləməsi ilə hazırlanmış Wrangler.', 'desc_en' => 'Wrangler prepared with lift kit, tire and bumper upgrade.', 'brand' => 'Jeep', 'model' => 'Wrangler JL', 'featured' => true],
            ['title_az' => 'Nissan Patrol Y62 Səhra Versiyası', 'title_en' => 'Nissan Patrol Y62 Desert Edition', 'desc_az' => 'Səhra şəraitinə uyğun hazırlanmış Patrol Y62.', 'desc_en' => 'Patrol Y62 prepared for desert conditions.', 'brand' => 'Nissan', 'model' => 'Patrol Y62', 'featured' => true],
            ['title_az' => 'Suzuki Jimny Mini Monster', 'title_en' => 'Suzuki Jimny Mini Monster', 'desc_az' => 'Kiçik ölçü, böyük imkanlar - Jimny offroad tuninqi.', 'desc_en' => 'Small size, big capabilities - Jimny offroad tuning.', 'brand' => 'Suzuki', 'model' => 'Jimny', 'featured' => true],
            ['title_az' => 'Ford Bronco Macəra Quruluşu', 'title_en' => 'Ford Bronco Adventure Build', 'desc_az' => 'Yeni Ford Bronco tam macəra quruluşu ilə.', 'desc_en' => 'New Ford Bronco with complete adventure build.', 'brand' => 'Ford', 'model' => 'Bronco', 'featured' => false],
            ['title_az' => 'Land Rover Defender Ekspedisiya', 'title_en' => 'Land Rover Defender Expedition', 'desc_az' => 'Defender uzun yol ekspedisiyasına hazır.', 'desc_en' => 'Defender ready for long-distance expedition.', 'brand' => 'Land Rover', 'model' => 'Defender', 'featured' => false],
            ['title_az' => 'Toyota Hilux İş Maşını Tuninqi', 'title_en' => 'Toyota Hilux Work Truck Build', 'desc_az' => 'Hilux iş və offroad üçün hazırlanıb.', 'desc_en' => 'Hilux built for work and offroad.', 'brand' => 'Toyota', 'model' => 'Hilux', 'featured' => false],
            ['title_az' => 'Mitsubishi Pajero Klassik Restore', 'title_en' => 'Mitsubishi Pajero Classic Restore', 'desc_az' => 'Klassik Pajero yenilənmiş offroad avadanlıqla.', 'desc_en' => 'Classic Pajero with updated offroad equipment.', 'brand' => 'Mitsubishi', 'model' => 'Pajero', 'featured' => false],
            ['title_az' => 'Toyota 4Runner Trail Edition', 'title_en' => 'Toyota 4Runner Trail Edition', 'desc_az' => '4Runner cığır versiyası, tam hazır.', 'desc_en' => '4Runner trail edition, fully prepared.', 'brand' => 'Toyota', 'model' => '4Runner', 'featured' => false],
            ['title_az' => 'Jeep Gladiator Overlander', 'title_en' => 'Jeep Gladiator Overlander', 'desc_az' => 'Gladiator overland kampinq quruluşu.', 'desc_en' => 'Gladiator overland camping build.', 'brand' => 'Jeep', 'model' => 'Gladiator', 'featured' => false],
            ['title_az' => 'Nissan Navara Ekspedisiya', 'title_en' => 'Nissan Navara Expedition', 'desc_az' => 'Navara uzun yol üçün hazırlanmış versiya.', 'desc_en' => 'Navara long-distance expedition version.', 'brand' => 'Nissan', 'model' => 'Navara', 'featured' => false],
            ['title_az' => 'Chevrolet Tahoe Offroad Pro', 'title_en' => 'Chevrolet Tahoe Offroad Pro', 'desc_az' => 'Tahoe güclü offroad tuninqi ilə.', 'desc_en' => 'Tahoe with powerful offroad tuning.', 'brand' => 'Chevrolet', 'model' => 'Tahoe', 'featured' => false],
        ];

        foreach ($galleryData as $i => $g) {
            $img = $this->downloadImage(
                "https://images.unsplash.com/{$galleryImages[$i]}?w=1000&q=80",
                'gallery', "gallery-" . ($i + 1) . ".jpg"
            );
            GalleryItem::updateOrCreate(
                ['sort_order' => $i],
                [
                    'title_az' => $g['title_az'],
                    'title_en' => $g['title_en'],
                    'description_az' => $g['desc_az'],
                    'description_en' => $g['desc_en'],
                    'image_path' => $img,
                    'vehicle_brand_id' => $brands[$g['brand']]->id,
                    'vehicle_model_id' => $models[$g['model']]?->id,
                    'is_featured' => $g['featured'],
                    'is_active' => true,
                ]
            );
        }
        $this->command?->info('12 gallery items created.');

        // ── Blog Posts ──
        $blogImages = [
            'photo-1533473359331-0135ef1b58bf', 'photo-1581235707960-35f13cf42a63',
            'photo-1536766820879-059fec98ec0a', 'photo-1516912481808-3406841bd33c',
            'photo-1504215680853-026ed2a45def', 'photo-1558618666-fcd25c85f82e',
        ];
        $blogPosts = [
            [
                'slug' => 'en-yaxsi-suspenziya-secimi',
                'title_az' => 'Offroad üçün ən yaxşı suspenziya seçimi',
                'title_en' => 'Best Suspension Choices for Offroad',
                'excerpt_az' => 'Düzgün suspenziya seçimi offroad performansını kökündən dəyişir. Bu məqalədə ən yaxşı variantları araşdırırıq.',
                'excerpt_en' => 'The right suspension choice fundamentally changes offroad performance. In this article, we explore the best options.',
                'content_az' => '<h2>Niyə suspenziya vacibdir?</h2><p>Offroad sürüşündə asma sistemi avtomobilin ən vacib komponentidir. Düzgün seçilmiş amortizatorlar və yaylar həm rahatlığı, həm də idarəetməni yaxşılaşdırır.</p><h2>Ən yaxşı brendlər</h2><p>Old Man Emu, Bilstein, Dobinsons və Fox Racing kimi brendlər offroad dünyasında özlərini sübut ediblər. Hər birinin fərqli güclü tərəfləri var.</p><p>Old Man Emu Avstraliyada istehsal olunur və sərt şəraitlər üçün nəzərdə tutulub. Bilstein Almaniya keyfiyyəti ilə monotube texnologiyası təqdim edir. Seçim avtomobilinizin növünə və istifadə məqsədinə görə dəyişir.</p>',
                'content_en' => '<h2>Why is suspension important?</h2><p>In offroad driving, the suspension system is the most crucial component of the vehicle. Properly chosen shock absorbers and springs improve both comfort and handling.</p><h2>Top brands</h2><p>Brands like Old Man Emu, Bilstein, Dobinsons, and Fox Racing have proven themselves in the offroad world. Each has different strengths.</p><p>Old Man Emu is manufactured in Australia and designed for harsh conditions. Bilstein offers German quality with monotube technology. The choice varies based on your vehicle type and intended use.</p>',
                'category_tag' => 'suspension',
                'published_at' => now()->subDays(5),
            ],
            [
                'slug' => 'lc200-tuning-guide',
                'title_az' => 'Toyota Land Cruiser 200 tuninq bələdçisi',
                'title_en' => 'Toyota Land Cruiser 200 Tuning Guide',
                'excerpt_az' => 'LC200 sahibləri üçün tam offroad tuninq bələdçisi - nədən başlamalı?',
                'excerpt_en' => 'Complete offroad tuning guide for LC200 owners - where to start?',
                'content_az' => '<h2>LC200 üçün ilk addımlar</h2><p>Toyota Land Cruiser 200 artıq zavoddan güclü bir offroad avtomobilidir. Lakin düzgün tuninq ilə onu daha da yaxşılaşdırmaq mümkündür.</p><h2>Tövsiyə olunan sıra</h2><p>1. Suspenziya yüksəltmə (2-3 düym lift kit)<br>2. Təkər yeniləmə (285/70R17 ölçü ideal)<br>3. Ön bamper və bucurqad<br>4. Snorkel quraşdırması<br>5. İşıqlandırma təkmilləşdirmə</p><p>Bu sıra ilə getmək büdcənizi bölüşdürmək və hər addımda nəticə görmək üçün ən optimal yoldur.</p>',
                'content_en' => '<h2>First steps for LC200</h2><p>The Toyota Land Cruiser 200 is already a powerful offroad vehicle from the factory. However, with proper tuning, it can be improved even further.</p><h2>Recommended order</h2><p>1. Suspension lift (2-3 inch lift kit)<br>2. Tire upgrade (285/70R17 size is ideal)<br>3. Front bumper and winch<br>4. Snorkel installation<br>5. Lighting upgrade</p><p>Following this order is the most optimal way to distribute your budget and see results at each step.</p>',
                'category_tag' => 'tuning',
                'published_at' => now()->subDays(15),
            ],
            [
                'slug' => 'led-isiqlandirma-rehberi',
                'title_az' => 'LED işıqlandırma: Niyə keçməlisiniz?',
                'title_en' => 'LED Lighting: Why You Should Switch',
                'excerpt_az' => 'LED işıqlar halogenə nisbətən 3-5 dəfə daha parlaq və daha az enerji istifadə edir.',
                'excerpt_en' => 'LED lights are 3-5 times brighter than halogen and use less energy.',
                'content_az' => '<h2>LED vs Halogen</h2><p>Müasir LED texnologiyası offroad işıqlandırmanı tamamilə dəyişib. LED işıqlar halogen və HID-ə nisbətən daha parlaq, daha davamlı və daha az enerji istehlak edir.</p><p>Bir LED işıq barı gecə sürüşündə görünürlüyü dramatik şəkildə artırır. 20,000+ lümen parlaqlıq 500 metrədən çox məsafəni aydınladır.</p>',
                'content_en' => '<h2>LED vs Halogen</h2><p>Modern LED technology has completely changed offroad lighting. LED lights are brighter, more durable, and consume less energy than halogen and HID alternatives.</p><p>A single LED light bar dramatically increases visibility during night driving. 20,000+ lumen brightness illuminates over 500 meters of distance.</p>',
                'category_tag' => 'lighting',
                'published_at' => now()->subDays(30),
            ],
            [
                'slug' => 'xilasetme-avadanligi',
                'title_az' => 'Xilasetmə avadanlığının önəmi',
                'title_en' => 'The Importance of Recovery Gear',
                'excerpt_az' => 'Hər offroad macərasında xilasetmə avadanlığı olmalıdır. Lazım olanda artıq gec ola bilər.',
                'excerpt_en' => 'Every offroad adventure needs recovery gear. When you need it, it may be too late.',
                'content_az' => '<h2>Əsas xilasetmə dəsti</h2><p>Hər offroad avtomobilində minimum xilasetmə avadanlığı olmalıdır. Bu dəstə daxildir: xilasetmə taxtaları, snatch strap, D-ring bağlantıları, hava kompressoru və lopata.</p><p>MAXTRAX və TRED kimi xilasetmə taxtaları qumda və palçıqda batdıqda ən effektiv vasitədir.</p>',
                'content_en' => '<h2>Essential recovery kit</h2><p>Every offroad vehicle should carry minimum recovery equipment. This kit includes: recovery boards, snatch strap, D-ring shackles, air compressor, and shovel.</p><p>Recovery boards like MAXTRAX and TRED are the most effective tools when stuck in sand or mud.</p>',
                'category_tag' => 'recovery',
                'published_at' => now()->subDays(45),
            ],
            [
                'slug' => 'snorkel-qurasdirilmasi',
                'title_az' => 'Snorkel quraşdırma rehberi',
                'title_en' => 'Snorkel Installation Guide',
                'excerpt_az' => 'Snorkel quraşdırması mühərriki su və tozdan qoruyur. Doğru quraşdırma vacibdir.',
                'excerpt_en' => 'Snorkel installation protects the engine from water and dust. Proper installation is crucial.',
                'content_az' => '<h2>Snorkel nə üçün lazımdır?</h2><p>Snorkel mühərrikə təmiz havayı dam səviyyəsindən alır. Bu iki əsas fayda təmin edir: su keçidlərində mühərriki qoruyur və tozlu yollarda filtrasiya keyfiyyətini artırır.</p><p>Safari və ARB kimi premium brendlər hər avtomobil modeli üçün xüsusi uyğunlaşdırılmış snorkellər istehsal edir.</p>',
                'content_en' => '<h2>Why do you need a snorkel?</h2><p>A snorkel draws clean air to the engine from roof level. This provides two main benefits: protects the engine during water crossings and improves filtration quality on dusty roads.</p><p>Premium brands like Safari and ARB manufacture snorkels custom-fitted for each vehicle model.</p>',
                'category_tag' => 'snorkels',
                'published_at' => now()->subDays(60),
            ],
            [
                'slug' => 'en-yaxsi-offroad-tekerleri-2024',
                'title_az' => '2024 ən yaxşı offroad təkərləri',
                'title_en' => 'Best Offroad Tires of 2024',
                'excerpt_az' => 'BFGoodrich, Nitto, Mickey Thompson və daha çox - hansı təkəri seçməli?',
                'excerpt_en' => 'BFGoodrich, Nitto, Mickey Thompson and more - which tire to choose?',
                'content_az' => '<h2>All-Terrain vs Mud-Terrain</h2><p>Təkər seçimi sürüş stilinizə görə dəyişir. 80% asfalt, 20% offroad sürürsünüzsə all-terrain (AT) təkərlər idealdır. BFGoodrich KO2 bu kateqoriyanın liderdir.</p><p>Əgər ciddi offroad çılpınırsınızsa, Nitto Trail Grappler və ya Mickey Thompson Baja Boss kimi palçıq təkərləri daha uyğundur.</p>',
                'content_en' => '<h2>All-Terrain vs Mud-Terrain</h2><p>Tire choice varies based on your driving style. If you drive 80% on-road and 20% offroad, all-terrain (AT) tires are ideal. BFGoodrich KO2 is the leader in this category.</p><p>If you do serious offroading, mud terrain tires like Nitto Trail Grappler or Mickey Thompson Baja Boss are more suitable.</p>',
                'category_tag' => 'tires',
                'published_at' => now()->subDays(75),
            ],
        ];

        foreach ($blogPosts as $i => $post) {
            $img = $this->downloadImage(
                "https://images.unsplash.com/{$blogImages[$i]}?w=1200&q=80",
                'blog', "blog-" . ($i + 1) . ".jpg"
            );
            BlogPost::updateOrCreate(
                ['slug' => $post['slug']],
                [
                    'title_az' => $post['title_az'],
                    'title_en' => $post['title_en'],
                    'excerpt_az' => $post['excerpt_az'],
                    'excerpt_en' => $post['excerpt_en'],
                    'content_az' => $post['content_az'],
                    'content_en' => $post['content_en'],
                    'featured_image' => $img,
                    'category_tag' => $post['category_tag'],
                    'is_published' => true,
                    'published_at' => $post['published_at'],
                    'meta_title_az' => $post['title_az'] . ' | 4WD.az',
                    'meta_title_en' => $post['title_en'] . ' | 4WD.az',
                    'meta_description_az' => $post['excerpt_az'],
                    'meta_description_en' => $post['excerpt_en'],
                ]
            );
        }
        $this->command?->info('6 blog posts created.');
        $this->command?->info('✅ All dummy data seeded successfully!');
    }
}
