<?php

namespace App\Filament\Widgets;

use App\Models\BlogPost;
use App\Models\GalleryItem;
use App\Models\Lead;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 0;

    protected function getStats(): array
    {
        return [
            Stat::make('Total Products', Product::count())
                ->description('All products')
                ->descriptionIcon('heroicon-m-cube')
                ->color('success'),
            Stat::make('Total Leads (New)', Lead::where('status', 'new')->count())
                ->description('New leads awaiting contact')
                ->descriptionIcon('heroicon-m-phone')
                ->color('danger'),
            Stat::make('Total Blog Posts', BlogPost::count())
                ->description('All blog posts')
                ->descriptionIcon('heroicon-m-document-text')
                ->color('info'),
            Stat::make('Total Gallery Items', GalleryItem::count())
                ->description('All gallery items')
                ->descriptionIcon('heroicon-m-photo')
                ->color('warning'),
        ];
    }
}
