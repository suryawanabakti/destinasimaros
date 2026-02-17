<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Services\OpenAIService;
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
            'destination' => $destination->load(['reviews.user', 'images']),
        ]);
    }

    public function search(Request $request, OpenAIService $openAIService)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $allDestinations = Destination::all();
        $aiResult = $openAIService->searchDestinations($query, $allDestinations->toArray());

        $recommendedIds = $aiResult['ids'] ?? [];
        $message = $aiResult['message'] ?? '';
        $audioUrl = $aiResult['audio_url'] ?? null;

        if (empty($recommendedIds)) {
            return response()->json([
                'data' => [],
                'message' => $message,
                'audio_url' => $audioUrl
            ]);
        }

        // Urutkan berdasarkan rekomendasi AI
        $destinations = Destination::whereIn('id', $recommendedIds)
            ->with(['images']) // Load images for search results too
            ->get()
            ->sortBy(function ($destination) use ($recommendedIds) {
                return array_search($destination->id, $recommendedIds);
            })
            ->values();

        return response()->json([
            'data' => $destinations,
            'message' => $message,
            'audio_url' => $audioUrl
        ]);
    }

    // Admin CRUD Methods
    public function adminIndex()
    {
        $destinations = Destination::withCount('images')->latest()->paginate(10);

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
            'destination' => $destination->load('images'),
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
