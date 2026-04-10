<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleGenerationSpec extends Model
{
    protected $fillable = [
        'vehicle_generation_id',
        'specs',
    ];

    protected $casts = [
        'vehicle_generation_id' => 'integer',
        'specs' => 'array',
    ];

    public function vehicleGeneration(): BelongsTo
    {
        return $this->belongsTo(VehicleGeneration::class);
    }
}
