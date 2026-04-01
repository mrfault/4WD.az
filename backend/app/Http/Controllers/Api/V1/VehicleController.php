<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleBrandResource;
use App\Http\Resources\VehicleModelResource;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehicleController extends Controller
{
    public function brands(): AnonymousResourceCollection
    {
        $brands = VehicleBrand::query()
            ->active()
            ->withCount(['vehicleModels' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->get();

        return VehicleBrandResource::collection($brands);
    }

    public function models(int $brandId): AnonymousResourceCollection
    {
        $brand = VehicleBrand::active()->findOrFail($brandId);

        $models = VehicleModel::query()
            ->where('vehicle_brand_id', $brand->id)
            ->active()
            ->orderBy('name')
            ->get();

        return VehicleModelResource::collection($models);
    }
}
