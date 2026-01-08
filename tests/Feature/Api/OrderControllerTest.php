<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create([
            'wallet_balance' => 100.00,
            'role' => 'customer'
        ]);
        
        // Create test product and variant
        $this->product = Product::create([
            'name' => 'MTN',
            'network' => 'MTN',
            'description' => 'MTN Data',
            'expiry' => '30 days',
            'product_type' => 'agent_product',
            'has_variants' => true
        ]);
        
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'price' => 5.00,
            'variant_attributes' => ['size' => '1GB'],
            'status' => 'IN STOCK'
        ]);
    }

    /** @test */
    public function it_should_create_order_successfully()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 5, // Agent MTN
            'size' => '1GB'
        ]);

        // This should not return 500 error
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'order' => [
                'reference_id',
                'total',
                'status',
                'network',
                'beneficiary_number'
            ]
        ]);
    }

    /** @test */
    public function it_should_handle_undefined_product_type_variable()
    {
        Sanctum::actingAs($this->user);

        // This test specifically targets the bug where $productType is used before definition
        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 5,
            'size' => '1GB'
        ]);

        // Should not return 500 Internal Server Error
        $this->assertNotEquals(500, $response->getStatusCode());
    }

    /** @test */
    public function it_should_return_proper_error_for_invalid_network_id()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 999, // Invalid network ID
            'size' => '1GB'
        ]);

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Invalid network ID']);
    }

    /** @test */
    public function it_should_return_error_for_insufficient_balance()
    {
        // Create user with low balance
        $poorUser = User::factory()->create([
            'wallet_balance' => 1.00,
            'role' => 'customer'
        ]);
        
        Sanctum::actingAs($poorUser);

        $response = $this->postJson('/api/v1/normal-orders', [
            'beneficiary_number' => '0543949478',
            'network_id' => 5,
            'size' => '1GB'
        ]);

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Insufficient wallet balance']);
    }
}