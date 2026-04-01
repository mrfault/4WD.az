<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->input('locale', app()->getLocale());
        $isDiscounted = $this->old_price && $this->old_price > $this->price;
        $discountPercentage = $isDiscounted
            ? round((($this->old_price - $this->price) / $this->old_price) * 100)
            : 0;

        $primaryImage = $this->whenLoaded('images', function () {
            $path = $this->images->sortBy('sort_order')->first()?->image_path;
            return $path ? asset('storage/' . $path) : null;
        });

        $compatibilitySummary = $this->whenLoaded('compatibilities', function () {
            return $this->compatibilities
                ->filter(fn ($c) => $c->relationLoaded('vehicleBrand') && $c->vehicleBrand)
                ->map(fn ($c) => implode(' ', array_filter([
                    $c->vehicleBrand?->name,
                    $c->relationLoaded('vehicleModel') ? $c->vehicleModel?->name : null,
                ])))
                ->unique()
                ->values();
        });

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'title' => $this->{'title_' . $locale} ?? $this->title_az,
            'price' => (float) $this->price,
            'old_price' => $this->old_price ? (float) $this->old_price : null,
            'is_discounted' => $isDiscounted,
            'discount_percentage' => $discountPercentage,
            'stock_status' => $this->stock_status,
            'is_hot_sale' => $this->is_hot_sale,
            'is_featured' => $this->is_featured,
            'image' => $primaryImage,
            'primary_image' => $primaryImage,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'compatibilities' => $compatibilitySummary,
        ];
    }
}
