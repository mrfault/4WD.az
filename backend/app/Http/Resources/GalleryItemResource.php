<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->input('locale', app()->getLocale());

        return [
            'id' => $this->id,
            'title' => $this->{'title_' . $locale} ?? $this->title_az,
            'title_az' => $this->title_az,
            'title_en' => $this->title_en,
            'description' => $this->{'description_' . $locale} ?? $this->description_az,
            'image_path' => $this->image_path,
            'is_featured' => $this->is_featured,
            'brand' => $this->whenLoaded('vehicleBrand', fn () => new VehicleBrandResource($this->vehicleBrand)),
            'model' => $this->whenLoaded('vehicleModel', fn () => new VehicleModelResource($this->vehicleModel)),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
