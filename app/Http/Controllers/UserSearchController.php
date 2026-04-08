<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $users = [];

        if ($search !== '') {
            $users = User::query()
                ->where('id', '!=', $request->user()->id)
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->limit(20)
                ->get();
        }

        return Inertia::render('Dashboard', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}