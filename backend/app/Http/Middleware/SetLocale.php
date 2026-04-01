<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED_LOCALES = ['az', 'en'];
    private const DEFAULT_LOCALE = 'az';

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->input('locale');

        if (! $locale) {
            $acceptLanguage = $request->header('Accept-Language', '');
            // Parse first language tag from Accept-Language header
            $locale = strtolower(substr($acceptLanguage, 0, 2));
        }

        if (! in_array($locale, self::SUPPORTED_LOCALES, true)) {
            $locale = self::DEFAULT_LOCALE;
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
