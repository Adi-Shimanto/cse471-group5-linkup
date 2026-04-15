<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Personality & Individual Preferences
            $table->string('personality')->nullable();
            $table->json('purpose')->nullable();
            $table->string('communication_style')->nullable();

            // Group Preferences
            $table->json('group_type')->nullable();
            $table->string('group_size')->nullable();

            // AI Profile
            $table->text('bio')->nullable();
            $table->string('ideal_person')->nullable();
            $table->string('dislike_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'personality',
                'purpose',
                'communication_style',
                'group_type',
                'group_size',
                'bio',
                'ideal_person',
                'dislike_type',
            ]);
        });
    }
};