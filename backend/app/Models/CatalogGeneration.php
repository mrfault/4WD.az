<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogGeneration extends Model
{
    protected $fillable = [
        'catalog_model_id',
        'name',
        'slug',
        'year_from',
        'year_to',
        'image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'catalog_model_id' => 'integer',
        'year_from' => 'integer',
        'year_to' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function catalogModel(): BelongsTo
    {
        return $this->belongsTo(CatalogModel::class);
    }

    public function specs(): HasMany
    {
        return $this->hasMany(CatalogGenerationSpec::class)->orderBy('sort_order');
    }

    public function images(): HasMany
    {
        return $this->hasMany(CatalogGenerationImage::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
