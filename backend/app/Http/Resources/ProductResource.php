<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->input('locale', app()->getLocale());
        $isDiscounted = $this->old_price && $this->old_price > $this->price;
        $discountPercentage = $isDiscounted
            ? round((($this->old_price - $this->price) / $this->old_price) * 100)
            : 0;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'title' => $this->{'title_' . $locale} ?? $this->title_az,
            'title_az' => $this->title_az,
            'title_en' => $this->title_en,
            'short_description' => $this->{'short_description_' . $locale} ?? $this->short_description_az,
            'short_description_az' => $this->short_description_az,
            'short_description_en' => $this->short_description_en,
            'description' => $this->{'description_' . $locale} ?? $this->description_az,
            'description_az' => $this->description_az,
            'description_en' => $this->description_en,
            'price' => (float) $this->price,
            'old_price' => $this->old_price ? (float) $this->old_price : null,
            'is_discounted' => $isDiscounted,
            'discount_percentage' => $discountPercentage,
            'stock_status' => $this->stock_status,
            'is_hot_sale' => $this->is_hot_sale,
            'is_featured' => $this->is_featured,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($image) => [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'alt_text' => $image->alt_text,
                    'sort_order' => $image->sort_order,
                ]);
            }),
            'compatibilities' => $this->whenLoaded('compatibilities', function () {
                return $this->compatibilities->map(fn ($c) => [
                    'id' => $c->id,
                    'brand' => $c->relationLoaded('vehicleBrand') && $c->vehicleBrand ? [
                        'id' => $c->vehicleBrand->id,
                        'name' => $c->vehicleBrand->name,
                        'slug' => $c->vehicleBrand->slug,
                    ] : null,
                    'model' => $c->relationLoaded('vehicleModel') && $c->vehicleModel ? [
                        'id' => $c->vehicleModel->id,
                        'name' => $c->vehicleModel->name,
                        'slug' => $c->vehicleModel->slug,
                        'year_from' => $c->vehicleModel->year_from,
                        'year_to' => $c->vehicleModel->year_to,
                    ] : null,
                    'notes' => $c->notes,
                ]);
            }),
            'meta_title' => $this->{'meta_title_' . $locale} ?? $this->meta_title_az,
            'meta_description' => $this->{'meta_description_' . $locale} ?? $this->meta_description_az,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
