<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/reports/Index');
    }

    public function visits()
    {
        // For now, using destinations as a proxy for visit reports
        $destinations = Destination::withCount('reviews')->orderBy('reviews_count', 'desc')->get();
        return Inertia::render('admin/reports/Visits', [
            'reports' => $destinations
        ]);
    }

    public function userLogins()
    {
        $users = User::whereNotNull('last_login_at')
            ->orderBy('last_login_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'last_login_at']);

        return Inertia::render('admin/reports/UserLogins', [
            'reports' => $users
        ]);
    }

    public function reviews()
    {
        $reviews = Review::with(['user', 'destination'])
            ->latest()
            ->get();

        return Inertia::render('admin/reports/Reviews', [
            'reports' => $reviews
        ]);
    }

    public function users()
    {
        $users = User::latest()->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('admin/reports/Users', [
            'reports' => $users
        ]);
    }
}
