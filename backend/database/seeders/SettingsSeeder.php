<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $keys = [
            'contact_phone',
            'contact_email',
            'address_az',
            'address_en',
            'telegram_bot_token',
            'telegram_chat_id',
            'working_hours_az',
            'working_hours_en',
            'instagram_url',
            'facebook_url',
            'youtube_url',
            'tiktok_url',
            'whatsapp_number',
        ];

        foreach ($keys as $key) {
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => '']
            );
        }
    }
}
