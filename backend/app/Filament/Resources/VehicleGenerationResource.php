<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehicleGenerationResource\Pages;
use App\Models\VehicleBrand;
use App\Models\VehicleGeneration;
use App\Models\VehicleModel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class VehicleGenerationResource extends Resource
{
    protected static ?string $model = VehicleGeneration::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Nəqliyyat';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Nəsillər';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('vehicle_brand_id')
                            ->label('Brand')
                            ->options(VehicleBrand::orderBy('name')->pluck('name', 'id'))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(fn (Set $set) => $set('vehicle_model_id', null))
                            ->dehydrated(false)
                            ->afterStateHydrated(function (Set $set, ?VehicleGeneration $record) {
                                if ($record?->vehicleModel) {
                                    $set('vehicle_brand_id', $record->vehicleModel->vehicle_brand_id);
                                }
                            }),
                        Forms\Components\Select::make('vehicle_model_id')
                            ->label('Model')
                            ->options(function (Get $get) {
                                $brandId = $get('vehicle_brand_id');
                                if (! $brandId) {
                                    return [];
                                }

                                return VehicleModel::where('vehicle_brand_id', $brandId)
                                    ->orderBy('name')
                                    ->pluck('name', 'id');
                            })
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state))),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('year_from')
                            ->label('Year From')
                            ->numeric()
                            ->required(),
                        Forms\Components\TextInput::make('year_to')
                            ->label('Year To')
                            ->numeric()
                            ->nullable()
                            ->placeholder('hal-hazırda'),
                        Forms\Components\FileUpload::make('image')
                            ->label('Cover şəkil')
                            ->disk('public')
                            ->directory('generations')
                            ->image()
                            ->nullable(),
                        Forms\Components\FileUpload::make('gallery')
                            ->label('Slider şəkilləri')
                            ->disk('public')
                            ->directory('generations/gallery')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->maxFiles(20)
                            ->nullable()
                            ->columnSpanFull(),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Texniki Xüsusiyyətlər')
                    ->description('Specs scraper vasitəsilə avtomatik doldurulur')
                    ->schema([
                        Forms\Components\Placeholder::make('specs_info')
                            ->label('')
                            ->content(function (?VehicleGeneration $record): string {
                                if (! $record?->spec?->specs) {
                                    return 'Hələ spec əlavə olunmayıb';
                                }
                                $specs = $record->spec->specs;
                                if (is_array($specs) && isset($specs['modifications'])) {
                                    $count = count($specs['modifications']);
                                    return "{$count} modifikasiya mövcuddur";
                                }
                                if (is_array($specs)) {
                                    $groups = count($specs);
                                    $items = array_sum(array_map(fn ($g) => count($g['items'] ?? []), $specs));
                                    return "{$groups} qrup, {$items} parametr";
                                }
                                return 'Spec mövcuddur';
                            }),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->disk('public')
                    ->circular()
                    ->defaultImageUrl(fn () => 'https://placehold.co/40x40/f3f4f6/9ca3af?text=4WD'),
                Tables\Columns\TextColumn::make('vehicleModel.vehicleBrand.name')
                    ->label('Brand')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('vehicleModel.name')
                    ->label('Model')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Generation')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('year_range')
                    ->label('Years')
                    ->getStateUsing(function (VehicleGeneration $record): string {
                        $from = $record->year_from;
                        $to = $record->year_to ?? 'hal-hazırda';

                        return "{$from} - {$to}";
                    }),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('vehicle_model_id')
                    ->label('Model')
                    ->relationship('vehicleModel', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
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
            'index' => Pages\ListVehicleGenerations::route('/'),
            'create' => Pages\CreateVehicleGeneration::route('/create'),
            'edit' => Pages\EditVehicleGeneration::route('/{record}/edit'),
        ];
    }
}
