<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->input('locale', app()->getLocale());

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->{'title_' . $locale} ?? $this->title_az,
            'title_az' => $this->title_az,
            'title_en' => $this->title_en,
            'excerpt' => $this->{'excerpt_' . $locale} ?? $this->excerpt_az,
            'content' => $this->{'content_' . $locale} ?? $this->content_az,
            'featured_image' => $this->featured_image ? asset('storage/' . $this->featured_image) : null,
            'category_tag' => $this->category_tag,
            'published_at' => $this->published_at?->toISOString(),
            'meta_title' => $this->{'meta_title_' . $locale} ?? $this->meta_title_az,
            'meta_description' => $this->{'meta_description_' . $locale} ?? $this->meta_description_az,
        ];
    }
}
