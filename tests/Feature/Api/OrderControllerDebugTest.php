<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class OrderControllerDebugTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_fixes_the_undefined_product_type_variable_bug()
    {
        // Create test user with sufficient balance
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'wallet_balance' => 100.00,
            'role' => 'customer'
        ]);
        
        // Create test product for agent network
        $product = Product::create([
            'name' => 'MTN',
            'network' => 'MTN',
            'description' => 'MTN Data',
            'expiry' => '30 days',
            'product_type' => 'agent_product',
            'has_variants' => true
        ]);
        
        // Create test variant
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'price' => 5.00,
            'variant_attributes' => ['size' => '1GB'],
            'status' => 'IN STOCK'
        ]);

        // Authenticate user with Sanctum
        Sanctum::actingAs($user);

        // Test the API endpoint that was returning 500 error
        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 5, // Agent MTN
            'size' => '1GB'
        ]);

        // Should NOT return 500 Internal Server Error anymore
        $this->assertNotEquals(500, $response->getStatusCode());
        
        // Should return 201 Created for successful order
        $response->assertStatus(201);
        
        // Should return proper JSON structure
        $response->assertJsonStructure([
            'message',
            'order' => [
                'reference_id',
                'total',
                'status',
                'network',
                'beneficiary_number',
                'created_at',
                'user',
                'products'
            ]
        ]);
        
        // Verify the order was created
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'network' => 'MTN',
            'beneficiary_number' => '0543949478',
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function it_handles_vip_product_access_correctly()
    {
        // Create regular user (not VIP)
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'regular@example.com',
            'password' => bcrypt('password'),
            'wallet_balance' => 100.00,
            'role' => 'customer'
        ]);

        Sanctum::actingAs($user);

        // Try to access VIP product (network_id 13-16)
        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 13, // VIP MTN
            'size' => '1GB'
        ]);

        // Should return 403 Forbidden, not 500 error
        $response->assertStatus(403);
        $response->assertJson([
            'error' => 'Access denied. VIP products are only available to VIP users.'
        ]);
    }

    /** @test */
    public function it_handles_invalid_network_id()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'wallet_balance' => 100.00,
            'role' => 'customer'
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 999, // Invalid network ID
            'size' => '1GB'
        ]);

        // Should return 400 Bad Request, not 500 error
        $response->assertStatus(400);
        $response->assertJson(['error' => 'Invalid network ID']);
    }

    /** @test */
    public function it_handles_insufficient_wallet_balance()
    {
        // Create user with low balance
        $user = User::create([
            'name' => 'Poor User',
            'email' => 'poor@example.com',
            'password' => bcrypt('password'),
            'wallet_balance' => 1.00, // Insufficient balance
            'role' => 'customer'
        ]);
        
        // Create expensive product
        $product = Product::create([
            'name' => 'MTN',
            'network' => 'MTN',
            'description' => 'MTN Data',
            'expiry' => '30 days',
            'product_type' => 'agent_product',
            'has_variants' => true
        ]);
        
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'price' => 50.00, // More than user's balance
            'variant_attributes' => ['size' => '1GB'],
            'status' => 'IN STOCK'
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 5,
            'size' => '1GB'
        ]);

        // Should return 400 Bad Request, not 500 error
        $response->assertStatus(400);
        $response->assertJson(['error' => 'Insufficient wallet balance']);
    }
}