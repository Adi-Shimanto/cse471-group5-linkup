<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserActivity;
use App\Models\Subscription;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AiMatchController extends Controller
{
    use LogsActivity;

    public function index()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        $isPremium = $user->is_premium;
        
        // Get remaining searches
        $dailySearches = (int)($user->daily_searches ?? 0);
        $lastDate = $user->last_search_date;
        
        if ($lastDate != date('Y-m-d')) {
            $dailySearches = 0;
        }
        
        $remaining = 3 - $dailySearches;
        $remainingSearches = $isPremium ? 'Unlimited' : max(0, $remaining);
        
        return Inertia::render('AiMatch', [
            'suggestions' => [],
            'aiMessage' => null,
            'interests' => '',
            'remainingSearches' => $remainingSearches,
            'isPremium' => $isPremium,
        ]);
    }

    public function match(Request $request)
    {
        $request->validate([
            'interests' => ['required', 'string', 'max:500'],
        ]);

        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        $originalInterest = $request->interests;
        $interest = strtolower($originalInterest);
        
        // Check subscription directly from database
        /** @var \App\Models\User $user */
        $hasActiveSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->exists();
        
        $isPremium = $hasActiveSub;
        
        // Get current search count directly from database (fresh data)
        $freshUser = User::find($user->id);
        $currentSearches = (int)($freshUser->daily_searches ?? 0);
        $lastDate = $freshUser->last_search_date;
        
        // Reset if new day
        if ($lastDate != date('Y-m-d')) {
            $currentSearches = 0;
        }
        
        // BLOCK if free user and already 3 searches
        if (!$isPremium && $currentSearches >= 3) {
            return back()->with('error', 'Daily search limit reached (3/day). Upgrade to Premium for unlimited AI matches!');
        }

        // Get AI insights from Gemini API
        $aiMessage = $this->getGeminiSuggestions($interest);

        // Find matching users based on search interest
        $potentialMatches = User::where('id', '!=', $user->id)
            ->where(function ($query) use ($interest) {
                $query->whereRaw('LOWER(personality) LIKE ?', ["%{$interest}%"])
                    ->orWhereRaw('LOWER(purpose::text) LIKE ?', ["%{$interest}%"])
                    ->orWhereRaw('LOWER(interests::text) LIKE ?', ["%{$interest}%"])
                    ->orWhereRaw('LOWER(bio) LIKE ?', ["%{$interest}%"])
                    ->orWhereRaw('LOWER(communication_style) LIKE ?', ["%{$interest}%"]);
            })
            ->limit(20)
            ->get();

        // Calculate compatibility scores for each match
        foreach ($potentialMatches as $match) {
            $match->compatibility_score = $this->calculateCompatibilityScore($user, $match);
        }

        // Sort by compatibility score (highest first)
        $suggestions = $potentialMatches->sortByDesc('compatibility_score')->values();

        // Add compatibility level to each suggestion
        foreach ($suggestions as $suggestion) {
            $suggestion->compatibility_level = $this->getCompatibilityLevel($suggestion->compatibility_score);
        }

        // SIMPLIFIED INCREMENT - ALWAYS ADD 1
        if (!$isPremium) {
            $updateUser = User::find($user->id);
            $updateUser->daily_searches = ($updateUser->daily_searches ?? 0) + 1;
            $updateUser->last_search_date = date('Y-m-d');
            $updateUser->save();
            $user = $updateUser;
        }

        // Log the search activity for activity tracker
        $this->logActivity(
            'ai_search',
            null,
            "Searched for interest: {$interest}",
            ['search_term' => $interest, 'results_count' => $suggestions->count()]
        );

        // Calculate remaining searches for display
        $finalUser = User::find($user->id);
        $finalSearches = (int)($finalUser->daily_searches ?? 0);
        $finalDate = $finalUser->last_search_date;
        
        if ($finalDate != date('Y-m-d')) {
            $remainingForDisplay = 3;
        } else {
            $remainingForDisplay = max(0, 3 - $finalSearches);
        }
        
        $remainingSearches = $isPremium ? 'Unlimited' : $remainingForDisplay;

        return Inertia::render('AiMatch', [
            'suggestions' => $suggestions,
            'aiMessage' => $aiMessage,
            'interests' => $originalInterest,
            'remainingSearches' => $remainingSearches,
            'isPremium' => $isPremium,
        ]);
    }

    /**
     * Get AI suggestions from Gemini API
     */
    private function getGeminiSuggestions($interest)
    {
        // Debug logs
        Log::info('=== GEMINI API CALL ===');
        Log::info('Search interest: ' . $interest);
        
        $apiKey = env('GEMINI_API_KEY');
        Log::info('API Key from .env: ' . ($apiKey ? 'YES (length: ' . strlen($apiKey) . ')' : 'NO - MISSING!'));
        
        if (!$apiKey) {
            Log::error('Gemini API key is MISSING! Check your .env file.');
            return "Based on your interests, we found some great potential matches for you!";
        }
        
        try {
            $response = Http::timeout(30)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey,
                [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => "A user has these interests: {$interest}. Write 2-3 short, friendly sentences suggesting what kind of people or communities would be a great match for them. Be specific. Keep it under 120 words. No markdown. No bullet points."
                                ]
                            ]
                        ]
                    ]
                ]
            );
            
            Log::info('API Response Status: ' . $response->status());
            
            if ($response->successful()) {
                $data = $response->json();
                $aiMessage = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($aiMessage) {
                    Log::info('✅ Gemini API SUCCESS! Message: ' . substr($aiMessage, 0, 100));
                    return $aiMessage;
                } else {
                    Log::warning('API response successful but no message found');
                }
            } else {
                Log::error('API Error Response: ' . $response->body());
            }
            
        } catch (\Exception $e) {
            Log::error('API Exception: ' . $e->getMessage());
        }
        
        Log::info('Using fallback message');
        return "Based on your interests, we found some great potential matches for you!";
    }

    /**
     * Calculate compatibility score between two users
     */
    private function calculateCompatibilityScore($user, $match)
    {
        $score = 0;
        
        // Personality match (30% weight)
        $personalityScores = [
            'extrovert' => ['extrovert' => 30, 'ambivert' => 20, 'introvert' => 10],
            'introvert' => ['introvert' => 30, 'ambivert' => 20, 'extrovert' => 10],
            'ambivert' => ['ambivert' => 30, 'extrovert' => 20, 'introvert' => 20],
        ];
        
        $userPersonality = strtolower($user->personality ?? 'ambivert');
        $matchPersonality = strtolower($match->personality ?? 'ambivert');
        $score += $personalityScores[$userPersonality][$matchPersonality] ?? 15;
        
        // Purpose overlap (40% weight)
        $userPurposes = $this->decodeJson($user->purpose);
        $matchPurposes = $this->decodeJson($match->purpose);
        $commonPurposes = array_intersect($userPurposes, $matchPurposes);
        $score += count($userPurposes) > 0 ? (count($commonPurposes) / count($userPurposes)) * 40 : 20;
        
        // Interest overlap (30% weight)
        $userInterests = $this->decodeJson($user->interests);
        $matchInterests = $this->decodeJson($match->interests);
        $commonInterests = array_intersect($userInterests, $matchInterests);
        $score += count($userInterests) > 0 ? (count($commonInterests) / count($userInterests)) * 30 : 15;
        
        return round(min($score, 100));
    }

    /**
     * Get compatibility level based on score
     */
    private function getCompatibilityLevel($score)
    {
        if ($score >= 80) return 'high';
        if ($score >= 60) return 'good';
        if ($score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Decode JSON fields safely
     */
    private function decodeJson($field)
    {
        if (empty($field)) return [];
        if (is_array($field)) return $field;
        if (is_string($field)) {
            $decoded = json_decode($field, true);
            if (is_array($decoded)) return $decoded;
            if (preg_match('/^{"(.*)"}$/', $field, $matches)) {
                return explode('","', $matches[1]);
            }
            return [$field];
        }
        return [];
    }
}