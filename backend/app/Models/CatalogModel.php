<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogModel extends Model
{
    protected $fillable = [
        'catalog_brand_id',
        'name',
        'slug',
        'body_type',
        'image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'catalog_brand_id' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function catalogBrand(): BelongsTo
    {
        return $this->belongsTo(CatalogBrand::class);
    }

    public function catalogGenerations(): HasMany
    {
        return $this->hasMany(CatalogGeneration::class);
    }

    public function getGenerationsCountAttribute(): int
    {
        return $this->catalogGenerations()->where('is_active', true)->count();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
