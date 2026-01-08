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
        // First, clean up any invalid product_type data
        DB::statement("UPDATE products SET product_type = 'customer_product' WHERE product_type NOT IN ('agent_product', 'customer_product', 'dealer_product')");
        
        // First, change the column to a regular string to avoid enum constraints
        DB::statement("ALTER TABLE products MODIFY COLUMN product_type VARCHAR(30) NOT NULL");
        
        // Then change it back to enum with the new values
        DB::statement("ALTER TABLE products MODIFY COLUMN product_type ENUM('agent_product', 'customer_product', 'dealer_product', 'vip_product') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE products MODIFY COLUMN product_type ENUM('agent_product', 'customer_product', 'dealer_product') NOT NULL");
    }
};