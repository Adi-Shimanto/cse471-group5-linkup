<?php
namespace App\Http\Controllers;

use App\Models\Share;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShareController extends Controller
{
    public function store($postId)
    {
        $post = Post::findOrFail($postId);

        // Check if user already shared this post
        $alreadyShared = Share::where('user_id', Auth::id())
            ->where('post_id', $post->id)
            ->exists();

        if ($alreadyShared) {
            return back()->with('error', 'You already shared this post.');
        }

        Share::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ]);

        return back()->with('success', 'Post shared successfully.');
    }
}