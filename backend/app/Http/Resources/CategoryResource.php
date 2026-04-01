<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->input('locale', app()->getLocale());

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->{'name_' . $locale} ?? $this->name_az,
            'name_az' => $this->name_az,
            'name_en' => $this->name_en,
            'description' => $this->{'description_' . $locale} ?? $this->description_az,
            'icon' => $this->icon,
            'image' => $this->image,
            'parent_id' => $this->parent_id,
            'sort_order' => $this->sort_order,
            'products_count' => $this->whenCounted('products'),
            'meta_title' => $this->{'meta_title_' . $locale} ?? $this->meta_title_az,
            'meta_description' => $this->{'meta_description_' . $locale} ?? $this->meta_description_az,
        ];
    }
}
