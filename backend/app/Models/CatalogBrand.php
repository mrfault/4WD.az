<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogBrand extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'country',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function catalogModels(): HasMany
    {
        return $this->hasMany(CatalogModel::class);
    }

    public function getModelsCountAttribute(): int
    {
        return $this->catalogModels()->where('is_active', true)->count();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
