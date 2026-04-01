<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'slug',
        'title_az',
        'title_en',
        'excerpt_az',
        'excerpt_en',
        'content_az',
        'content_en',
        'featured_image',
        'category_tag',
        'is_published',
        'published_at',
        'meta_title_az',
        'meta_title_en',
        'meta_description_az',
        'meta_description_en',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }
}
