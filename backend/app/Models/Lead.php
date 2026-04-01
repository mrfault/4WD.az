<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    protected $fillable = [
        'product_id',
        'source',
        'customer_name',
        'phone',
        'message',
        'page_url',
        'locale',
        'telegram_sent_at',
        'status',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'telegram_sent_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
