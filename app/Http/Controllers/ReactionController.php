<?php
namespace App\Http\Controllers;

use App\Models\Reaction;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    public function store(Request $request, $postId)
    {
        $request->validate([
            'emoji' => ['required', 'string', 'in:like,love,haha,wow,sad,angry'],
        ]);

        $post = Post::findOrFail($postId);

        // If user already reacted, update their reaction
        // If not, create a new one
        Reaction::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'post_id' => $post->id,
            ],
            [
                'emoji' => $request->emoji,
            ]
        );

        return back()->with('success', 'Reaction added.');
    }

    public function destroy($postId)
    {
        Reaction::where('user_id', Auth::id())
            ->where('post_id', $postId)
            ->delete();

        return back()->with('success', 'Reaction removed.');
    }
}
