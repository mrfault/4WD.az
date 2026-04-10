<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_model_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('year_from');
            $table->integer('year_to')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('vehicle_generation_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_generation_id')->constrained()->cascadeOnDelete();
            $table->json('specs')->nullable();
            $table->timestamps();

            $table->unique('vehicle_generation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_generation_specs');
        Schema::dropIfExists('vehicle_generations');
    }
};
