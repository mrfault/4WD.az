<?php

use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\GalleryController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\VehicleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/categories/{slug}/products', [ProductController::class, 'byCategory']);

    // Gallery
    Route::get('/gallery', [GalleryController::class, 'index']);
    Route::get('/gallery/{id}', [GalleryController::class, 'show']);

    // Blog
    Route::get('/blog', [BlogController::class, 'index']);
    Route::get('/blog/{slug}', [BlogController::class, 'show']);

    // Leads (rate limited: 5 per minute per IP)
    Route::post('/leads', [LeadController::class, 'store'])
        ->middleware('throttle:5,1');

    // Vehicles
    Route::get('/vehicles/brands', [VehicleController::class, 'brands']);
    Route::get('/vehicles/brands/{brandId}/models', [VehicleController::class, 'models']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);

    // Search
    Route::get('/search', [SearchController::class, 'search']);

    // Catalog
    Route::get('/catalog/brands', [CatalogController::class, 'brands']);
    Route::get('/catalog/{brandSlug}/{modelSlug}/{genSlug}/products', [CatalogController::class, 'generationProducts']);
    Route::get('/catalog/{brandSlug}/{modelSlug}/{genSlug}', [CatalogController::class, 'generationDetail']);
    Route::get('/catalog/{brandSlug}/{modelSlug}', [CatalogController::class, 'generations']);
    Route::get('/catalog/{brandSlug}', [CatalogController::class, 'models']);
});
