<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('sku')->nullable();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('title_az');
            $table->string('title_en');
            $table->text('short_description_az')->nullable();
            $table->text('short_description_en')->nullable();
            $table->text('description_az')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->enum('stock_status', ['in_stock', 'by_order'])->default('in_stock');
            $table->boolean('is_hot_sale')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('meta_title_az')->nullable();
            $table->string('meta_title_en')->nullable();
            $table->text('meta_description_az')->nullable();
            $table->text('meta_description_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
