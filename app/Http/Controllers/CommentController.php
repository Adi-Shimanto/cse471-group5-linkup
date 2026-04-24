<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, $postId)
    {
        $request->validate([
            'content' => ['required', 'string', 'max:500'],
        ]);

        $post = Post::findOrFail($postId);

        Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'content' => $request->content,
        ]);

        return back()->with('success', 'Comment added successfully.');
    }

    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        // Only the comment owner can delete it
        if ($comment->user_id !== Auth::id()) {
            return back()->with('error', 'Unauthorized.');
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}