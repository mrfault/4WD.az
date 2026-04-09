<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogGenerationImage extends Model
{
    protected $fillable = [
        'catalog_generation_id',
        'image',
        'alt_text',
        'sort_order',
    ];

    protected $casts = [
        'catalog_generation_id' => 'integer',
        'sort_order' => 'integer',
    ];

    public function catalogGeneration(): BelongsTo
    {
        return $this->belongsTo(CatalogGeneration::class);
    }
}
