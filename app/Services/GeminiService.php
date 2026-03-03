<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    public function searchDestinations(string $query, array $destinations): array
    {
        $destinationsList = array_map(function ($dest) {
            return [
                'id' => $dest['id'],
                'name' => $dest['name'],
                'description' => $dest['description'],
                'tags' => is_string($dest['tags']) ? json_decode($dest['tags'], true) : $dest['tags'],
            ];
        }, $destinations);

        $prompt = "Berikut adalah daftar destinasi wisata di Maros, Sulawesi Selatan:\n\n";
        foreach ($destinationsList as $dest) {
            $tags = implode(', ', $dest['tags'] ?? []);
            $prompt .= "- ID: {$dest['id']}, Nama: {$dest['name']}, Deskripsi: {$dest['description']}, Tags: {$tags}\n";
        }

        $prompt .= "\nPertanyaan user: \"{$query}\"\n\n";
        $prompt .= "Berdasarkan pertanyaan user, lakukan hal berikut:\n";
        $prompt .= "1. Pilih destinasi yang paling relevan.\n";
        $prompt .= "2. Buatlah pesan jawaban yang ramah, menarik, dan informatif (seolah-olah Anda adalah tour guide lokal yang antusias) yang menjelaskan rekomendasi tersebut secara singkat (maksimal 2 kalimat).\n";
        $prompt .= "3. Kembalikan respons dalam format JSON valid dengan struktur: {\"ids\": [ID1, ID2, ...], \"message\": \"Pesan jawaban Anda di sini\"}.\n";
        $prompt .= "Jangan berikan penjelasan lain di luar JSON.";

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::post("{$this->baseUrl}?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $content = $data['candidates'][0]['content']['parts'][0]['text'];

                    // Clean up markdown if present
                    $content = str_replace(['```json', '```'], '', $content);
                    $result = json_decode(trim($content), true);

                    if (is_array($result)) {
                        return [
                            'ids' => $result['ids'] ?? [],
                            'message' => $result['message'] ?? 'Maaf, saya tidak menemukan destinasi yang cocok.',
                            'audio_url' => null
                        ];
                    }
                }
                Log::warning('Gemini unexpected response structure: ' . $response->body());
            }

            Log::error('Gemini API Error: ' . $response->status() . ' - ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Gemini Service Exception: ' . $e->getMessage());
        }

        return ['ids' => [], 'message' => 'Terjadi kesalahan saat menghubungi AI.', 'audio_url' => null];
    }
}
