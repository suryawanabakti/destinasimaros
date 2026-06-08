<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TtsController extends Controller
{
    /**
     * Synthesize speech using ElevenLabs API.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function synthesize(Request $request)
    {

        $request->validate([
            'text' => 'required|string|max:5000',
            'voice_id' => 'sometimes|string', // Optional: allow overriding voice
            'model_id' => 'sometimes|string', // Optional: allow overriding model
        ]);

        try {
            $apiKey = config('services.elevenlabs.key');
            if (! $apiKey) {
                Log::error('ElevenLabs API key not configured');

                return response()->json(['error' => 'TTS service not configured'], 500);
            }

            // Default voice and model for Indonesian (if available) or a good multilingual voice
            // ElevenLabs has multilingual v2 model that supports many languages including Indonesian
            $voiceId = $request->voice_id ?? 'EXAVITQu4vr4xnSDxMaL'; // Bella (good for many languages)
            $modelId = $request->model_id ?? 'eleven_multilingual_v2';

            $response = Http::withHeaders([
                'xi-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post("https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}", [
                'text' => $request->text,
                'model_id' => $modelId,
                'voice_settings' => [
                    'stability' => 0.5,
                    'similarity_boost' => 0.75,
                    'style' => 0.0,
                    'use_speaker_boost' => true,
                ],
            ]);

            if ($response->failed()) {
                Log::error('ElevenLabs API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json(['error' => 'TTS service failed'], $response->status());
            }

            // Return the audio data as base64 so we can play it in the frontend
            $audioBase64 = base64_encode($response->body());

            return response()->json([
                'audioBase64' => $audioBase64,
                'mimeType' => 'audio/mpeg',
            ]);

        } catch (\Exception $e) {
            Log::error('TTS Error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
