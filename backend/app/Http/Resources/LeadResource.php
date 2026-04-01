<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'phone' => $this->phone,
            'message' => $this->message,
            'source' => $this->source,
            'product_id' => $this->product_id,
            'page_url' => $this->page_url,
            'locale' => $this->locale,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
