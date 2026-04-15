<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show registration page
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle registration request
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // ✅ CREATE USER WITH QUIZ DATA
        $user = User::create([
            // BASIC INFO
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // 🧠 INDIVIDUAL PREFERENCE QUIZ
            'personality' => $request->personality,
            'purpose' => $request->purpose ? json_encode($request->purpose) : null,
            'communication_style' => $request->communication_style,

            // 👥 GROUP PREFERENCES
            'group_type' => $request->group_type ? json_encode($request->group_type) : null,
            'group_size' => $request->group_size,

            // 🤖 AI PROFILE DATA
            'bio' => $request->bio,
            'ideal_person' => $request->ideal_person,
            'dislike_type' => $request->dislike_type,
        ]);

        // Trigger Laravel event
        event(new Registered($user));

        // Auto login user
        Auth::login($user);

        // Redirect to dashboard
        return redirect('/dashboard');
    }
}