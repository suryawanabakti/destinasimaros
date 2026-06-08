<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DestinationController extends Controller
{
    public function index()
    {
        return Inertia::render('Landing', [
            'initialDestinations' => Destination::take(6)->get(),
        ]);
    }

    public function show(Destination $destination)
    {
        return Inertia::render('Destination/Show', [
            'destination' => $destination->load(['reviews.user', 'images', 'facilities']),
        ]);
    }

    public function search(Request $request, GeminiService $geminiService)
    {
        $query = $request->input('query');
        $userLat = $request->input('latitude');
        $userLng = $request->input('longitude');

        if (! $query) {
            return response()->json([]);
        }

        $allDestinations = Destination::all();

        $destinationsArray = $allDestinations->toArray();

        // Calculate distance from user to each destination if location provided
        if ($userLat && $userLng) {
            $destinationsArray = array_map(function ($dest) use ($userLat, $userLng) {
                if ($dest['latitude'] && $dest['longitude']) {
                    $dest['distance_km'] = $this->calculateDistance(
                        (float) $userLat,
                        (float) $userLng,
                        (float) $dest['latitude'],
                        (float) $dest['longitude']
                    );
                }

                return $dest;
            }, $destinationsArray);
        }

        $aiResult = $geminiService->searchDestinations($query, $destinationsArray);

        $recommendedIds = $aiResult['ids'] ?? [];
        $message = $aiResult['message'] ?? '';
        $audioUrl = $aiResult['audio_url'] ?? null;

        if (empty($recommendedIds)) {
            return response()->json([
                'data' => [],
                'message' => $message,
                'audio_url' => $audioUrl,
            ]);
        }

        // Urutkan berdasarkan rekomendasi AI
        $destinations = Destination::whereIn('id', $recommendedIds)
            ->with(['images'])
            ->get()
            ->sortBy(function ($destination) use ($recommendedIds) {
                return array_search($destination->id, $recommendedIds);
            })
            ->values();

        return response()->json([
            'data' => $destinations,
            'message' => $message,
            'audio_url' => $audioUrl,
        ]);
    }

    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): int
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round($earthRadius * $c);
    }

    // Admin CRUD Methods
    public function adminIndex()
    {
        $destinations = Destination::withCount('images')->with('facilities')->latest()->paginate(10);

        return Inertia::render('admin/destinations/Index', [
            'destinations' => $destinations,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/destinations/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'operational_hours' => 'nullable|string|max:255',
            'entrance_fee' => 'nullable|string|max:255',
            'google_maps_url' => 'nullable|string|max:255',
            'visiting_tips' => 'nullable|array',
            'visiting_tips.*' => 'string',
            'facilities' => 'nullable|array',
            'facilities.*.name' => 'required_with:facilities|string|max:255',
            'facilities.*.price' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Handle primary image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        $destination = Destination::create($validated);

        // Handle facilities
        if ($request->filled('facilities')) {
            $destination->facilities()->createMany($validated['facilities']);
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $path = $file->store('destinations/gallery', 'public');
                $destination->images()->create([
                    'image_url' => Storage::url($path),
                ]);
            }
        }

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destinasi berhasil ditambahkan!');
    }

    public function edit(Destination $destination)
    {
        return Inertia::render('admin/destinations/Edit', [
            'destination' => $destination->load(['images', 'facilities']),
        ]);
    }

    public function update(Request $request, Destination $destination)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'operational_hours' => 'nullable|string|max:255',
            'entrance_fee' => 'nullable|string|max:255',
            'google_maps_url' => 'nullable|string|max:255',
            'visiting_tips' => 'nullable|array',
            'visiting_tips.*' => 'string',
            'facilities' => 'nullable|array',
            'facilities.*.name' => 'required_with:facilities|string|max:255',
            'facilities.*.price' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Handle primary image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($destination->image_url) {
                $oldPath = str_replace('/storage/', '', $destination->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $imagePath = $request->file('image')->store('destinations', 'public');
            $validated['image_url'] = Storage::url($imagePath);
        }

        $destination->update($validated);

        // Sync facilities
        if ($request->has('facilities')) {
            $destination->facilities()->delete();
            $destination->facilities()->createMany($validated['facilities'] ?? []);
        }

        // Handle new gallery images upload
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                $path = $file->store('destinations/gallery', 'public');
                $destination->images()->create([
                    'image_url' => Storage::url($path),
                ]);
            }
        }

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destinasi berhasil diperbarui!');
    }

    public function destroy(Destination $destination)
    {
        // Delete primary image if exists
        if ($destination->image_url) {
            $imagePath = str_replace('/storage/', '', $destination->image_url);
            Storage::disk('public')->delete($imagePath);
        }

        // Delete gallery images if exist
        foreach ($destination->images as $image) {
            $path = str_replace('/storage/', '', $image->image_url);
            Storage::disk('public')->delete($path);
        }

        $destination->delete();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destinasi berhasil dihapus!');
    }

    public function deleteImage(\App\Models\DestinationImage $image)
    {
        // Delete from storage
        $path = str_replace('/storage/', '', $image->image_url);
        Storage::disk('public')->delete($path);

        // Delete from database
        $image->delete();

        return back()->with('success', 'Gambar galeri berhasil dihapus!');
    }
}
