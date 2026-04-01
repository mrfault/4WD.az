<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GalleryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = GalleryItem::query()
            ->active()
            ->with(['vehicleBrand', 'vehicleModel', 'category']);

        if ($request->filled('brand_slug')) {
            $query->whereHas('vehicleBrand', fn ($q) => $q->where('slug', $request->input('brand_slug')));
        }

        if ($request->filled('model_slug')) {
            $query->whereHas('vehicleModel', fn ($q) => $q->where('slug', $request->input('model_slug')));
        }

        if ($request->filled('category_slug')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->input('category_slug')));
        }

        $items = $query->orderBy('sort_order')->paginate(12)->appends($request->query());

        return GalleryItemResource::collection($items);
    }

    public function show(int $id): GalleryItemResource
    {
        $item = GalleryItem::query()
            ->active()
            ->with(['vehicleBrand', 'vehicleModel', 'category'])
            ->findOrFail($id);

        return new GalleryItemResource($item);
    }
}
