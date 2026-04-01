<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $botToken;
    private string $chatId;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->chatId = config('services.telegram.chat_id', '');
    }

    public function sendLeadNotification(Lead $lead): bool
    {
        if (empty($this->botToken) || empty($this->chatId)) {
            Log::warning('Telegram bot token or chat ID not configured.');
            return false;
        }

        try {
            $message = $this->formatMessage($lead);

            $response = Http::post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                'chat_id' => $this->chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            if ($response->successful()) {
                $lead->update(['telegram_sent_at' => now()]);
                return true;
            }

            Log::error('Telegram API error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'lead_id' => $lead->id,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Telegram notification failed', [
                'lead_id' => $lead->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function formatMessage(Lead $lead): string
    {
        $lead->loadMissing('product');

        $lines = [
            "🔔 <b>New Lead from 4WD.az</b>",
            "",
            "📞 <b>Phone:</b> {$lead->phone}",
        ];

        if ($lead->customer_name) {
            $lines[] = "👤 <b>Name:</b> {$lead->customer_name}";
        }

        if ($lead->message) {
            $lines[] = "💬 <b>Message:</b> {$lead->message}";
        }

        $lines[] = "📍 <b>Source:</b> {$lead->source}";

        if ($lead->product) {
            $productTitle = $lead->product->title_az ?: $lead->product->title_en;
            $lines[] = "";
            $lines[] = "🛒 <b>Product:</b> {$productTitle}";
            $lines[] = "💰 <b>Price:</b> {$lead->product->price} AZN";
            $lines[] = "🔗 <b>SKU:</b> {$lead->product->sku}";
        }

        if ($lead->page_url) {
            $lines[] = "";
            $lines[] = "🌐 <b>Page:</b> {$lead->page_url}";
        }

        $lines[] = "";
        $lines[] = "🕐 {$lead->created_at->format('d.m.Y H:i')}";
        $lines[] = "🆔 Lead #{$lead->id}";

        return implode("\n", $lines);
    }
}
