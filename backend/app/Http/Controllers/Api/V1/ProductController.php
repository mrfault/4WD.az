<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->active()
            ->with(['category', 'images', 'compatibilities.vehicleBrand', 'compatibilities.vehicleModel']);

        // Filter by category slug
        if ($request->filled('category_slug')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->input('category_slug')));
        }

        // Filter by brand slug (via compatibilities)
        if ($request->filled('brand_slug')) {
            $query->whereHas('compatibilities.vehicleBrand', fn ($q) => $q->where('slug', $request->input('brand_slug')));
        }

        // Filter by model slug (via compatibilities)
        if ($request->filled('model_slug')) {
            $query->whereHas('compatibilities.vehicleModel', fn ($q) => $q->where('slug', $request->input('model_slug')));
        }

        // Price range filters
        if ($request->filled('price_min')) {
            $query->where('price', '>=', (float) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', (float) $request->input('price_max'));
        }

        // Stock status filter
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->input('stock_status'));
        }

        // Hot sale filter
        if ($request->filled('is_hot_sale')) {
            $query->where('is_hot_sale', filter_var($request->input('is_hot_sale'), FILTER_VALIDATE_BOOLEAN));
        }

        // Discounted filter
        if ($request->boolean('is_discounted')) {
            $query->discounted();
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        $query = match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'featured' => $query->orderBy('is_featured', 'desc')->orderBy('sort_order', 'asc'),
            default => $query->orderBy('created_at', 'desc'), // newest
        };

        $products = $query->paginate(12)->appends($request->query());

        return ProductListResource::collection($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->active()
            ->where('slug', $slug)
            ->with(['category', 'images', 'compatibilities.vehicleBrand', 'compatibilities.vehicleModel'])
            ->firstOrFail();

        // Related products: same category, exclude current, limit 6
        $relatedProducts = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'images'])
            ->limit(6)
            ->get();

        return response()->json([
            'data' => new ProductResource($product),
            'related' => ProductListResource::collection($relatedProducts),
        ]);
    }

    public function byCategory(string $categorySlug): AnonymousResourceCollection
    {
        $category = Category::where('slug', $categorySlug)->active()->firstOrFail();

        $products = Product::query()
            ->active()
            ->where('category_id', $category->id)
            ->with(['category', 'images', 'compatibilities.vehicleBrand', 'compatibilities.vehicleModel'])
            ->orderBy('sort_order')
            ->paginate(12);

        return ProductListResource::collection($products);
    }
}
