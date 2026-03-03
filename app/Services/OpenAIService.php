<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAIService
{
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key');
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
        $prompt .= "2. Buatlah **pesan jawaban** yang ramah, menarik, dan informatif (seolah-olah Anda adalah tour guide lokal yang antusias) yang menjelaskan rekomendasi tersebut secara singkat (maksimal 2 kalimat).\n";
        $prompt .= "3. Kembalikan respons dalam format JSON valid dengan struktur: {\"ids\": [ID1, ID2, ...], \"message\": \"Pesan jawaban Anda di sini\"}.\n";
        $prompt .= "Jangan berikan penjelasan lain di luar JSON.";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiKey}",
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Anda adalah 
                asisten pariwisata yang ahli tentang Maros, Sulawesi Selatan.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            $content = $response->json()['choices'][0]['message']['content'];

            $content = str_replace(['```json', '```'], '', $content);
            $result = json_decode(trim($content), true) ?? ['ids' => [], 'message' => ''];

            $audioUrl = null;
            if (!empty($result['message'])) {
                $audioUrl = $this->generateAudio($result['message']);
            }

            return [
                'ids' => $result['ids'] ?? [],
                'message' => $result['message'] ?? 'Maaf, saya tidak menemukan destinasi yang cocok.',
                'audio_url' => $audioUrl
            ];
        }

        return ['ids' => [], 'message' => 'Terjadi kesalahan saat menghubungi AI.', 'audio_url' => null];
    }
}
