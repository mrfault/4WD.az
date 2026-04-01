<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $lead = Lead::create($request->validated());

        // Dispatch Telegram notification (non-blocking, never fail)
        try {
            app(TelegramService::class)->sendLeadNotification($lead);
        } catch (\Throwable $e) {
            // Silently ignore - TelegramService already handles logging
        }

        return response()->json([
            'success' => true,
            'message' => 'Lead submitted successfully.',
            'data' => new LeadResource($lead),
        ], 201);
    }
}
