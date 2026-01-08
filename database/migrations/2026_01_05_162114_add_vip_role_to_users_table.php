<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, clean up any invalid role data
        DB::statement("UPDATE users SET role = 'customer' WHERE role NOT IN ('customer', 'agent', 'admin', 'dealer')");
        
        // First, change the column to a regular string to avoid enum constraints
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer'");
        
        // Then change it back to enum with the new values
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'agent', 'admin', 'dealer', 'vip') NOT NULL DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'agent', 'admin', 'dealer') NOT NULL DEFAULT 'customer'");
    }
};