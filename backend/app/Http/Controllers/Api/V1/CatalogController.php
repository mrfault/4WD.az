<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductListResource;
use App\Models\CatalogBrand;
use App\Models\CatalogGeneration;
use App\Models\CatalogModel;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    /**
     * GET /api/v1/catalog/brands
     * Returns all active catalog brands with their active model count.
     */
    public function brands(): JsonResponse
    {
        $brands = CatalogBrand::query()
            ->active()
            ->withCount(['catalogModels' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $data = $brands->map(fn (CatalogBrand $brand) => [
            'id'           => $brand->id,
            'name'         => $brand->name,
            'slug'         => $brand->slug,
            'logo'         => $brand->logo ? asset('storage/' . $brand->logo) : null,
            'country'      => $brand->country,
            'models_count' => $brand->catalog_models_count,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/catalog/{brandSlug}
     * Returns active models for a brand with generation count and brand info.
     */
    public function models(string $brandSlug): JsonResponse
    {
        $brand = CatalogBrand::query()
            ->active()
            ->where('slug', $brandSlug)
            ->firstOrFail();

        $models = CatalogModel::query()
            ->where('catalog_brand_id', $brand->id)
            ->active()
            ->withCount(['catalogGenerations' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $data = $models->map(fn (CatalogModel $model) => [
            'id'               => $model->id,
            'name'             => $model->name,
            'slug'             => $model->slug,
            'body_type'        => $model->body_type,
            'image'            => $model->image ? asset('storage/' . $model->image) : null,
            'brand'            => [
                'name' => $brand->name,
                'slug' => $brand->slug,
            ],
            'generations_count' => $model->catalog_generations_count,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/catalog/{brandSlug}/{modelSlug}
     * Returns active generations for a model.
     */
    public function generations(string $brandSlug, string $modelSlug): JsonResponse
    {
        $brand = CatalogBrand::query()
            ->active()
            ->where('slug', $brandSlug)
            ->firstOrFail();

        $model = CatalogModel::query()
            ->where('catalog_brand_id', $brand->id)
            ->where('slug', $modelSlug)
            ->active()
            ->firstOrFail();

        $generations = CatalogGeneration::query()
            ->where('catalog_model_id', $model->id)
            ->active()
            ->orderBy('sort_order')
            ->orderByDesc('year_from')
            ->get();

        $data = $generations->map(fn (CatalogGeneration $gen) => [
            'id'        => $gen->id,
            'name'      => $gen->name,
            'slug'      => $gen->slug,
            'year_from' => $gen->year_from,
            'year_to'   => $gen->year_to,
            'image'     => $gen->image ? asset('storage/' . $gen->image) : null,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/catalog/{brandSlug}/{modelSlug}/{genSlug}
     * Returns full generation detail: specs grouped by group_name and all images.
     */
    public function generationDetail(string $brandSlug, string $modelSlug, string $genSlug): JsonResponse
    {
        $brand = CatalogBrand::query()
            ->active()
            ->where('slug', $brandSlug)
            ->firstOrFail();

        $model = CatalogModel::query()
            ->where('catalog_brand_id', $brand->id)
            ->where('slug', $modelSlug)
            ->active()
            ->firstOrFail();

        $generation = CatalogGeneration::query()
            ->where('catalog_model_id', $model->id)
            ->where('slug', $genSlug)
            ->active()
            ->with(['specs', 'images'])
            ->firstOrFail();

        // Group specs by group_name; each group is an ordered array of {key, value} pairs.
        $specs = $generation->specs
            ->groupBy('group_name')
            ->map(fn ($items) => $items->map(fn ($spec) => [
                'key'   => $spec->spec_key,
                'value' => $spec->spec_value,
            ])->values())
            ->toArray();

        $images = $generation->images->map(fn ($img) => [
            'image'    => asset('storage/' . $img->image),
            'alt_text' => $img->alt_text,
        ])->values();

        return response()->json([
            'data' => [
                'id'        => $generation->id,
                'name'      => $generation->name,
                'slug'      => $generation->slug,
                'year_from' => $generation->year_from,
                'year_to'   => $generation->year_to,
                'image'     => $generation->image ? asset('storage/' . $generation->image) : null,
                'specs'     => $specs,
                'images'    => $images,
            ],
        ]);
    }

    /**
     * GET /api/v1/catalog/{brandSlug}/{modelSlug}/{genSlug}/products
     * Returns products compatible with the brand and model of this generation.
     * Compatibility is matched via product_compatibilities using vehicle_brand and vehicle_model slugs.
     */
    public function generationProducts(string $brandSlug, string $modelSlug, string $genSlug): JsonResponse
    {
        $brand = CatalogBrand::query()
            ->active()
            ->where('slug', $brandSlug)
            ->firstOrFail();

        $model = CatalogModel::query()
            ->where('catalog_brand_id', $brand->id)
            ->where('slug', $modelSlug)
            ->active()
            ->firstOrFail();

        // Verify the generation exists and belongs to this model.
        CatalogGeneration::query()
            ->where('catalog_model_id', $model->id)
            ->where('slug', $genSlug)
            ->active()
            ->firstOrFail();

        $products = Product::query()
            ->active()
            ->with(['category', 'images', 'compatibilities.vehicleBrand', 'compatibilities.vehicleModel'])
            ->whereHas('compatibilities', function ($q) use ($brandSlug, $modelSlug) {
                $q->whereHas('vehicleBrand', fn ($bq) => $bq->where('slug', $brandSlug))
                  ->whereHas('vehicleModel', fn ($mq) => $mq->where('slug', $modelSlug));
            })
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => ProductListResource::collection($products),
        ]);
    }
}
