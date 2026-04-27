<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action_type'); // 'post_reaction', 'comment', 'friend_request', 'profile_view', 'group_join', etc.
            $table->string('target_type')->nullable(); // 'App\Models\User', 'App\Models\Post', 'App\Models\Group', etc.
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_name')->nullable(); // Store name for quick display
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Store additional data like reaction type, comment content, etc.
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['user_id', 'created_at']);
            $table->index('action_type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_activities');
    }
};