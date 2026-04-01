<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BlogPostResource\Pages;
use App\Models\BlogPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class BlogPostResource extends Resource
{
    protected static ?string $model = BlogPost::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('General')
                    ->schema([
                        Forms\Components\TextInput::make('title_az')
                            ->label('Title (AZ)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_en')
                            ->label('Title (EN)')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state))),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('category_tag')
                            ->label('Category / Tag')
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_published')
                            ->label('Published')
                            ->default(false),
                        Forms\Components\DateTimePicker::make('published_at')
                            ->label('Publish Date')
                            ->nullable(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Featured Image')
                    ->schema([
                        Forms\Components\FileUpload::make('featured_image')
                            ->disk('public')
                            ->directory('blog')
                            ->image()
                            ->nullable(),
                    ]),

                Forms\Components\Section::make('Content (AZ)')
                    ->schema([
                        Forms\Components\Textarea::make('excerpt_az')
                            ->label('Excerpt (AZ)')
                            ->rows(3),
                        Forms\Components\RichEditor::make('content_az')
                            ->label('Content (AZ)')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Content (EN)')
                    ->schema([
                        Forms\Components\Textarea::make('excerpt_en')
                            ->label('Excerpt (EN)')
                            ->rows(3),
                        Forms\Components\RichEditor::make('content_en')
                            ->label('Content (EN)')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('SEO')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title_az')
                            ->label('Meta Title (AZ)')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('meta_title_en')
                            ->label('Meta Title (EN)')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('meta_description_az')
                            ->label('Meta Description (AZ)')
                            ->rows(2),
                        Forms\Components\Textarea::make('meta_description_en')
                            ->label('Meta Description (EN)')
                            ->rows(2),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('featured_image')
                    ->label('Image')
                    ->disk('public')
                    ->square()
                    ->size(60),
                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('is_published')
                    ->label('Status')
                    ->formatStateUsing(fn (bool $state) => $state ? 'Published' : 'Draft')
                    ->color(fn (bool $state) => $state ? 'success' : 'gray'),
                Tables\Columns\TextColumn::make('published_at')
                    ->label('Published At')
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->placeholder('Not set'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_published')
                    ->label('Published'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBlogPosts::route('/'),
            'create' => Pages\CreateBlogPost::route('/create'),
            'edit' => Pages\EditBlogPost::route('/{record}/edit'),
        ];
    }
}
