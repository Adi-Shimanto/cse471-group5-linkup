<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index()
    {
        return Post::with('user')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        Post::create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return back()->with('success', 'Post created successfully.');
    }
}
