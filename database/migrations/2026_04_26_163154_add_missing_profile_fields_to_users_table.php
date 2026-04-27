<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Location field
            $table->string('location')->nullable()->after('bio');
            
            // Interests/tags (JSON array)
            $table->json('interests')->nullable()->after('location');
            
            // Profile photo
            $table->string('profile_photo_path')->nullable()->after('interests');
            
            // Detailed ideal person description
            $table->text('ideal_person_description')->nullable()->after('ideal_person');
            
            // Privacy settings
            $table->boolean('privacy_show_email')->default(true)->after('profile_photo_path');
            $table->boolean('privacy_show_location')->default(true)->after('privacy_show_email');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'location',
                'interests',
                'profile_photo_path',
                'ideal_person_description',
                'privacy_show_email',
                'privacy_show_location'
            ]);
        });
    }
};