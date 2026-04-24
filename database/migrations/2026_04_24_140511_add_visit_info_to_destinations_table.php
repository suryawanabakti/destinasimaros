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
        // test
        Schema::table('destinations', function (Blueprint $table) {
            $table->string('operational_hours')->nullable();
            $table->string('entrance_fee')->nullable();
            $table->string('google_maps_url')->nullable();
            $table->json('visiting_tips')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn(['operational_hours', 'entrance_fee', 'google_maps_url', 'visiting_tips']);
        });
    }
};
