<?php

namespace App\Filament\Resources\VehicleGenerationResource\Pages;

use App\Filament\Resources\VehicleGenerationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehicleGenerations extends ListRecords
{
    protected static string $resource = VehicleGenerationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
