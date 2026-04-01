<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('source', ['product', 'contact', 'general'])->default('general');
            $table->string('customer_name')->nullable();
            $table->string('phone');
            $table->text('message')->nullable();
            $table->string('page_url')->nullable();
            $table->string('locale', 5)->default('az');
            $table->timestamp('telegram_sent_at')->nullable();
            $table->enum('status', ['new', 'contacted', 'closed'])->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
