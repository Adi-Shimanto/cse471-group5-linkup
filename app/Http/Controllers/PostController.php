<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Traits\LogsActivity;  // ← ADD THIS
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    use LogsActivity;  // ← ADD THIS

    public function index()
    {
        return Post::with([
            'user',
            'comments.user',
            'reactions',
            'shares',
        ])->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $post = Post::create([  // ← Changed to capture the created post
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        // ✅ ADD THIS: Log the activity
        $this->logActivity(
            'post_created',                           // action type
            $post,                                    // the target (post object)
            'Created a new post: ' . substr($post->content, 0, 50), // description
            ['post_id' => $post->id]                  // metadata
        );

        return back()->with('success', 'Post created successfully.');
    }
}