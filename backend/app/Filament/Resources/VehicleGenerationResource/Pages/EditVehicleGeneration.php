<?php

namespace App\Filament\Resources\VehicleGenerationResource\Pages;

use App\Filament\Resources\VehicleGenerationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehicleGeneration extends EditRecord
{
    protected static string $resource = VehicleGenerationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
