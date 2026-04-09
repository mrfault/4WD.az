<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('country')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('catalog_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('body_type')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['catalog_brand_id', 'slug']);
        });

        Schema::create('catalog_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_model_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->smallInteger('year_from')->nullable();
            $table->smallInteger('year_to')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('catalog_generation_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_generation_id')->constrained()->cascadeOnDelete();
            $table->string('group_name');
            $table->string('spec_key');
            $table->text('spec_value');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('catalog_generation_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_generation_id')->constrained()->cascadeOnDelete();
            $table->string('image');
            $table->string('alt_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_generation_images');
        Schema::dropIfExists('catalog_generation_specs');
        Schema::dropIfExists('catalog_generations');
        Schema::dropIfExists('catalog_models');
        Schema::dropIfExists('catalog_brands');
    }
};
