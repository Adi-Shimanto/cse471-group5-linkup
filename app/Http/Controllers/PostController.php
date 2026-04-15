<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return inertia('Profile/Edit', [
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        // ================= PROFILE UPDATE =================
        $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'personality' => 'nullable|string',
            'purpose' => 'nullable',
            'communication_style' => 'nullable|string',
            'group_type' => 'nullable',
            'ideal_person' => 'nullable|string',
            'dislike_type' => 'nullable|string',
        ]);

        $user->update([
            'name' => $request->name,
            'bio' => $request->bio,
            'personality' => $request->personality,
            'purpose' => is_array($request->purpose)
                ? json_encode($request->purpose)
                : $request->purpose,
            'communication_style' => $request->communication_style,
            'group_type' => is_array($request->group_type)
                ? json_encode($request->group_type)
                : $request->group_type,
            'ideal_person' => $request->ideal_person,
            'dislike_type' => $request->dislike_type,
        ]);

        // ================= PASSWORD UPDATE =================
        if ($request->filled('new_password')) {

            $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:6|confirmed',
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors([
                    'current_password' => 'Current password incorrect',
                ]);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);
        }

        return back()->with('success', 'Profile updated!');
    }
}