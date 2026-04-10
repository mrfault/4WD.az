<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleBrandResource;
use App\Http\Resources\VehicleModelResource;
use App\Models\VehicleBrand;
use App\Models\VehicleGeneration;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
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

    /**
     * GET /vehicles/brands/{brandSlug}/models-with-generations
     */
    public function modelsWithGenerations(string $brandSlug): JsonResponse
    {
        $brand = VehicleBrand::active()->where('slug', $brandSlug)->firstOrFail();

        $models = VehicleModel::query()
            ->where('vehicle_brand_id', $brand->id)
            ->active()
            ->with(['generations' => fn ($q) => $q->active()->orderByDesc('year_from')])
            ->orderBy('name')
            ->get();

        $data = $models->map(fn (VehicleModel $m) => [
            'id' => $m->id,
            'name' => $m->name,
            'slug' => $m->slug,
            'generations' => $m->generations->map(fn (VehicleGeneration $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'slug' => $g->slug,
                'year_from' => $g->year_from,
                'year_to' => $g->year_to,
                'image' => $g->image ? asset('storage/' . $g->image) : null,
            ])->values(),
        ]);

        return response()->json([
            'data' => $data,
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->logo ? asset('storage/' . $brand->logo) : null,
            ],
        ]);
    }

    /**
     * GET /vehicles/generations/{slug}
     */
    public function generationDetail(string $slug): JsonResponse
    {
        $generation = VehicleGeneration::query()
            ->active()
            ->where('slug', $slug)
            ->with(['vehicleModel.vehicleBrand', 'spec'])
            ->firstOrFail();

        $specs = $generation->spec?->specs ?? [];

        return response()->json([
            'data' => [
                'id' => $generation->id,
                'name' => $generation->name,
                'slug' => $generation->slug,
                'year_from' => $generation->year_from,
                'year_to' => $generation->year_to,
                'image' => $generation->image ? asset('storage/' . $generation->image) : null,
                'gallery' => collect($generation->gallery ?? [])->map(fn ($img) => asset('storage/' . $img))->values(),
                'specs' => $specs,
                'model' => [
                    'name' => $generation->vehicleModel->name,
                    'slug' => $generation->vehicleModel->slug,
                ],
                'brand' => [
                    'name' => $generation->vehicleModel->vehicleBrand->name,
                    'slug' => $generation->vehicleModel->vehicleBrand->slug,
                    'logo' => $generation->vehicleModel->vehicleBrand->logo
                        ? asset('storage/' . $generation->vehicleModel->vehicleBrand->logo) : null,
                ],
            ],
        ]);
    }
}
