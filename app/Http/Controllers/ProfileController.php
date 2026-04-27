<?php

namespace App\Http\Controllers;

use App\Traits\LogsActivity;  // ← ADD THIS
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use LogsActivity;  // ← ADD THIS

    public function edit(Request $request)
    {
        $user = $request->user();
        
        // Decode JSON fields
        $userData = $user->toArray();
        if ($user->purpose && is_string($user->purpose)) {
            $userData['purpose'] = json_decode($user->purpose, true);
        }
        if ($user->group_type && is_string($user->group_type)) {
            $userData['group_type'] = json_decode($user->group_type, true);
        }
        if ($user->interests && is_string($user->interests)) {
            $userData['interests'] = json_decode($user->interests, true);
        }
        
        // Add profile photo URL to the user data
        $userData['profile_photo_url'] = $this->getProfilePhotoUrl($user);
        
        return inertia('Profile/Edit', [
            'auth' => ['user' => $userData],
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $rules = [
            // Basic info
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            
            // Quiz fields
            'personality' => 'nullable|string|in:introvert,extrovert,ambivert',
            'purpose' => 'nullable|string',
            'communication_style' => 'nullable|string|max:100',
            'group_type' => 'nullable|string',
            'group_size' => 'nullable|string|in:small,medium,large',
            'ideal_person' => 'nullable|string|max:500',
            'ideal_person_description' => 'nullable|string|max:1000',
            'dislike_type' => 'nullable|string|max:500',
            
            // Additional fields
            'interests' => 'nullable|string',
            'privacy_show_email' => 'nullable|boolean',
            'privacy_show_location' => 'nullable|boolean',
            
            // Photo
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Password validation only if provided
        if ($request->filled('current_password')) {
            $rules['current_password'] = 'required|current_password';
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        // Prepare update data
        $updateData = [
            'name' => $validated['name'],
            'bio' => $validated['bio'] ?? null,
            'location' => $validated['location'] ?? null,
            'personality' => $validated['personality'] ?? null,
            'purpose' => $validated['purpose'] ?? null,
            'communication_style' => $validated['communication_style'] ?? null,
            'group_type' => $validated['group_type'] ?? null,
            'group_size' => $validated['group_size'] ?? null,
            'ideal_person' => $validated['ideal_person'] ?? null,
            'ideal_person_description' => $validated['ideal_person_description'] ?? null,
            'dislike_type' => $validated['dislike_type'] ?? null,
            'interests' => $validated['interests'] ?? null,
            'privacy_show_email' => $request->boolean('privacy_show_email'),
            'privacy_show_location' => $request->boolean('privacy_show_location'),
        ];

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $updateData['profile_photo_path'] = $path;
        }

        // Handle password update
        if ($request->filled('current_password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // ✅ ADD THIS: Log profile update (only if something changed)
        if (!empty($updateData)) {
            $changedFields = array_keys(array_filter($updateData, function($value, $key) use ($user) {
                return $value !== null && $user->getOriginal($key) != $value;
            }, ARRAY_FILTER_USE_BOTH));
            
            if (!empty($changedFields)) {
                $this->logActivity(
                    'profile_updated',
                    $user,
                    'Updated profile information: ' . implode(', ', $changedFields),
                    ['changed_fields' => $changedFields]
                );
            }
        }

        // Refresh the user to get updated data
        $user->refresh();

        // Return response with profile photo URL
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'location' => $user->location,
                'personality' => $user->personality,
                'purpose' => $user->purpose ? json_decode($user->purpose, true) : [],
                'communication_style' => $user->communication_style,
                'group_type' => $user->group_type ? json_decode($user->group_type, true) : [],
                'group_size' => $user->group_size,
                'ideal_person' => $user->ideal_person,
                'ideal_person_description' => $user->ideal_person_description,
                'dislike_type' => $user->dislike_type,
                'interests' => $user->interests ? json_decode($user->interests, true) : [],
                'privacy_show_email' => $user->privacy_show_email,
                'privacy_show_location' => $user->privacy_show_location,
                'profile_photo_url' => $this->getProfilePhotoUrl($user),
            ]
        ]);
    }

    /**
     * Display another user's profile (for profile views)
     */
    public function show($id)
    {
        $profileUser = \App\Models\User::findOrFail($id);
        $authUser = Auth::user();
        
        // ✅ ADD THIS: Log profile view (only if viewing someone else's profile)
        if ($authUser && $authUser->id != $profileUser->id) {
            $this->logActivity(
                'profile_view',
                $profileUser,
                'Viewed ' . $profileUser->name . "'s profile",
                ['viewed_user_id' => $profileUser->id]
            );
        }
        
        // Decode JSON fields for the profile user
        $userData = $profileUser->toArray();
        if ($profileUser->purpose && is_string($profileUser->purpose)) {
            $userData['purpose'] = json_decode($profileUser->purpose, true);
        }
        if ($profileUser->group_type && is_string($profileUser->group_type)) {
            $userData['group_type'] = json_decode($profileUser->group_type, true);
        }
        if ($profileUser->interests && is_string($profileUser->interests)) {
            $userData['interests'] = json_decode($profileUser->interests, true);
        }
        $userData['profile_photo_url'] = $this->getProfilePhotoUrl($profileUser);
        
        return inertia('Profile/Show', [
            'profileUser' => $userData,
            'authUser' => $authUser,
        ]);
    }

    /**
     * Get the profile photo URL for a user
     */
    private function getProfilePhotoUrl($user)
    {
        if ($user->profile_photo_path && Storage::disk('public')->exists($user->profile_photo_path)) {
            return asset('storage/' . $user->profile_photo_path);
        }
        
        // Fallback to avatar UI
        return 'https://ui-avatars.com/api/?name=' . urlencode($user->name) . '&background=6366f1&color=fff';
    }
}