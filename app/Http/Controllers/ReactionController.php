<?php
namespace App\Http\Controllers;

use App\Models\Reaction;
use App\Models\Post;
use App\Traits\LogsActivity;  // ← ADD THIS
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    use LogsActivity;  // ← ADD THIS

    public function store(Request $request, $postId)
    {
        $request->validate([
            'emoji' => ['required', 'string', 'in:like,love,haha,wow,sad,angry'],
        ]);

        $post = Post::findOrFail($postId);

        // Check if user already has a reaction
        $existingReaction = Reaction::where('user_id', Auth::id())
            ->where('post_id', $post->id)
            ->first();
        
        $oldEmoji = $existingReaction ? $existingReaction->emoji : null;

        // If user already reacted, update their reaction
        // If not, create a new one
        $reaction = Reaction::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'post_id' => $post->id,
            ],
            [
                'emoji' => $request->emoji,
            ]
        );

        // ✅ ADD THIS: Log the activity
        if ($oldEmoji && $oldEmoji !== $request->emoji) {
            // User changed their reaction
            $this->logActivity(
                'post_reaction_changed',
                $post,
                'Changed reaction from ' . $oldEmoji . ' to ' . $request->emoji . ' on a post',
                ['post_id' => $post->id, 'old_emoji' => $oldEmoji, 'new_emoji' => $request->emoji]
            );
        } elseif (!$existingReaction) {
            // New reaction
            $this->logActivity(
                'post_reaction',
                $post,
                'Reacted with ' . $request->emoji . ' to a post',
                ['post_id' => $post->id, 'emoji' => $request->emoji]
            );
        }

        return back()->with('success', 'Reaction added.');
    }

    public function destroy($postId)
    {
        $post = Post::findOrFail($postId);
        
        // Get the reaction before deleting it
        $reaction = Reaction::where('user_id', Auth::id())
            ->where('post_id', $postId)
            ->first();
        
        $emoji = $reaction ? $reaction->emoji : null;

        Reaction::where('user_id', Auth::id())
            ->where('post_id', $postId)
            ->delete();

        // ✅ ADD THIS: Log the activity
        if ($reaction) {
            $this->logActivity(
                'post_reaction_removed',
                $post,
                'Removed ' . $emoji . ' reaction from a post',
                ['post_id' => $post->id, 'emoji' => $emoji]
            );
        }

        return back()->with('success', 'Reaction removed.');
    }
}