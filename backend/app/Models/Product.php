<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'slug',
        'sku',
        'category_id',
        'title_az',
        'title_en',
        'short_description_az',
        'short_description_en',
        'description_az',
        'description_en',
        'price',
        'old_price',
        'stock_status',
        'is_hot_sale',
        'is_featured',
        'is_active',
        'sort_order',
        'meta_title_az',
        'meta_title_en',
        'meta_description_az',
        'meta_description_en',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
        'is_hot_sale' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function compatibilities(): HasMany
    {
        return $this->hasMany(ProductCompatibility::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeHotSale(Builder $query): Builder
    {
        return $query->where('is_hot_sale', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeDiscounted(Builder $query): Builder
    {
        return $query->whereNotNull('old_price')
                     ->whereColumn('old_price', '>', 'price');
    }
}
