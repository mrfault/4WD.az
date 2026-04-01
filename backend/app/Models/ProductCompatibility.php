<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCompatibility extends Model
{
    protected $fillable = [
        'product_id',
        'vehicle_brand_id',
        'vehicle_model_id',
        'notes',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'vehicle_brand_id' => 'integer',
        'vehicle_model_id' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vehicleBrand(): BelongsTo
    {
        return $this->belongsTo(VehicleBrand::class);
    }

    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class);
    }
}
