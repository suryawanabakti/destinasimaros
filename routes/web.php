<?php

use App\Http\Controllers\DestinationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DestinationController::class, 'index'])->name('home');
    Route::get('/search', [DestinationController::class, 'search'])->name('search');
    Route::get('/destinations/{destination}', [DestinationController::class, 'show'])->name('destinations.show');
    Route::post('/reviews', [\App\Http\Controllers\ReviewController::class, 'store'])->name('reviews.store');

    // Admin Routes
    Route::middleware(['admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard', [
                'totalDestinations' => \App\Models\Destination::count(),
                'totalUsers' => \App\Models\User::count(),
                'totalReviews' => \App\Models\Review::count(),
                'averageRating' => round(\App\Models\Review::avg('rating') ?? 0, 1),
                'recentDestinations' => \App\Models\Destination::latest()->take(6)->get(),
            ]);
        })->name('dashboard');

        // Admin Destination Management
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('destinations', [DestinationController::class, 'adminIndex'])->name('destinations.index');
            Route::get('destinations/create', [DestinationController::class, 'create'])->name('destinations.create');
            Route::post('destinations', [DestinationController::class, 'store'])->name('destinations.store');
            Route::get('destinations/{destination}/edit', [DestinationController::class, 'edit'])->name('destinations.edit');
            Route::put('destinations/{destination}', [DestinationController::class, 'update'])->name('destinations.update');
            Route::delete('destinations/{destination}', [DestinationController::class, 'destroy'])->name('destinations.destroy');

            // Reports
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [\App\Http\Controllers\ReportController::class, 'index'])->name('index');
                Route::get('visits', [\App\Http\Controllers\ReportController::class, 'visits'])->name('visits');
                Route::get('user-logins', [\App\Http\Controllers\ReportController::class, 'userLogins'])->name('user-logins');
                // Review route name is already in use for submissions, using reports.reviews
                Route::get('reviews', [\App\Http\Controllers\ReportController::class, 'reviews'])->name('reviews');
                Route::get('users', [\App\Http\Controllers\ReportController::class, 'users'])->name('users');
            });

            // Individual Image Deletion
            Route::delete('destination-images/{image}', [DestinationController::class, 'deleteImage'])->name('destination-images.destroy');
        });
    });
});

require __DIR__ . '/settings.php';
