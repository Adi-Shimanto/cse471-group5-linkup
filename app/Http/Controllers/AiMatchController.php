<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AiMatchController extends Controller
{
    public function index()
    {
        return Inertia::render('AiMatch', [
            'suggestions' => [],
            'aiMessage' => null,
        ]);
    }

    public function match(Request $request)
    {
        $request->validate([
            'interests' => ['required', 'string', 'max:500'],
        ]);

        $interests = $request->interests;

        // Call Gemini API
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => "A user on a social platform has these interests: {$interests}. Write 2-3 sentences describing what kind of people or communities would be a great match for them. Be friendly and specific. Do not use bullet points."
                        ]
                    ]
                ]
            ]
        ]);

        $aiMessage = null;
        if ($response->successful()) {
            $aiMessage = $response->json('candidates.0.content.parts.0.text');
        }

        // Get other users from database (excluding current user)
        $users = User::where('id', '!=', Auth::id())
            ->select('id', 'name', 'email')
            ->limit(5)
            ->get();

        return Inertia::render('AiMatch', [
            'suggestions' => $users,
            'aiMessage' => $aiMessage,
            'interests' => $interests,
        ]);
    }
}