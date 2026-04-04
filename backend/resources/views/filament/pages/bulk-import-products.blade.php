<x-filament-panels::page>
    <form wire:submit="import">
        {{ $this->form }}

        <div class="mt-6 flex gap-3">
            <x-filament::button type="submit" size="lg" icon="heroicon-o-arrow-up-tray">
                İdxal Et
            </x-filament::button>

            <x-filament::button color="gray" size="lg" icon="heroicon-o-arrow-down-tray" wire:click="downloadTemplate">
                Nümunə Excel Yüklə
            </x-filament::button>
        </div>
    </form>

    @if($showResults)
        <div class="mt-8">
            <x-filament::section>
                <x-slot name="heading">Nəticələr</x-slot>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <div class="text-3xl font-bold text-green-600">{{ $importResults['success'] ?? 0 }}</div>
                        <div class="text-sm text-green-700 dark:text-green-400 mt-1">Uğurlu</div>
                    </div>
                    <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                        <div class="text-3xl font-bold text-red-600">{{ $importResults['failed'] ?? 0 }}</div>
                        <div class="text-sm text-red-700 dark:text-red-400 mt-1">Uğursuz</div>
                    </div>
                </div>

                @if(!empty($importResults['errors']))
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                        <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Xətalar:</h4>
                        <ul class="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                            @foreach($importResults['errors'] as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
            </x-filament::section>
        </div>
    @endif

    <div class="mt-8">
        <x-filament::section collapsible>
            <x-slot name="heading">Format haqqında</x-slot>

            <div class="prose dark:prose-invert max-w-none text-sm">
                <p><strong>ZIP faylının strukturu:</strong></p>
                <pre style="color: #000 !important;" class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs">upload.zip
├── products.xlsx
└── images/
    ├── winch-12000_1.jpg
    ├── winch-12000_2.jpg
    ├── traction-board_1.jpg
    └── ...</pre>

                <p class="mt-4"><strong>Excel sütunları:</strong></p>
                <table class="text-xs">
                    <thead>
                        <tr>
                            <th>Sütun</th>
                            <th>Məcburi</th>
                            <th>Nümunə</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><code>title</code></td><td>Bəli</td><td>Winch 12000 lbs</td></tr>
                        <tr><td><code>category</code></td><td>Bəli</td><td>bucurqadlar-lebetka</td></tr>
                        <tr><td><code>price</code></td><td>Bəli</td><td>850</td></tr>
                        <tr><td><code>sku</code></td><td>Xeyr</td><td>WNC-001</td></tr>
                        <tr><td><code>old_price</code></td><td>Xeyr</td><td>950</td></tr>
                        <tr><td><code>stock_status</code></td><td>Xeyr</td><td>in_stock / by_order</td></tr>
                        <tr><td><code>short_description</code></td><td>Xeyr</td><td>Qısa təsvir</td></tr>
                        <tr><td><code>description</code></td><td>Xeyr</td><td>HTML ətraflı təsvir</td></tr>
                        <tr><td><code>is_hot_sale</code></td><td>Xeyr</td><td>1 / 0</td></tr>
                        <tr><td><code>is_featured</code></td><td>Xeyr</td><td>1 / 0</td></tr>
                        <tr><td><code>images</code></td><td>Xeyr</td><td>img1.jpg, img2.jpg</td></tr>
                        <tr><td><code>vehicle_brands</code></td><td>Xeyr</td><td>Toyota, Nissan</td></tr>
                        <tr><td><code>vehicle_models</code></td><td>Xeyr</td><td>Land Cruiser 200</td></tr>
                    </tbody>
                </table>
            </div>
        </x-filament::section>
    </div>
</x-filament-panels::page>
