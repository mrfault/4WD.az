<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VehicleGeneration extends Model
{
    protected $fillable = [
        'vehicle_model_id',
        'name',
        'slug',
        'year_from',
        'year_to',
        'image',
        'gallery',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'vehicle_model_id' => 'integer',
        'year_from' => 'integer',
        'year_to' => 'integer',
        'gallery' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class);
    }

    public function spec(): HasOne
    {
        return $this->hasOne(VehicleGenerationSpec::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
