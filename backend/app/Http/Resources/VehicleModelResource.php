<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleModelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'year_from' => $this->year_from,
            'year_to' => $this->year_to,
            'brand' => $this->whenLoaded('vehicleBrand', fn () => new VehicleBrandResource($this->vehicleBrand)),
        ];
    }
}
