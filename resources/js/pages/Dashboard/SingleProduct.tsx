import DashboardLayout from '../../layouts/DashboardLayout';
import GuestLayout from '../../layouts/GuestLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: number;
  name: string;
  price: number;
  network: string;
  expiry: string;
  product_type: 'customer_products' | 'agent_product' | 'dealer_product';
}

interface SingleProductProps extends PageProps {
  network: string;
  products: Product[];
  cartCount: number;
}

export default function SingleProduct({ auth }: SingleProductProps) {
  const { network, products, cartCount: serverCartCount } = usePage<SingleProductProps>().props;
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bundleSize, setBundleSize] = useState('');
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<Array<{value: string, label: string, price: number}>>([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const cartCount = auth.user ? serverCartCount : 0;

  // Network configuration
  const networkConfig = {
    mtn: {
      name: 'MTN',
      icon: '/mtnlogo.jpeg',
      gradient: 'from-accent to-accent/80',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      hoverBg: 'hover:bg-accent/20',
      buttonBg: 'bg-accent hover:bg-accent/80'
    },
    telecel: {
      name: 'Telecel',
      icon: '/telecellogo.png',
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      hoverBg: 'hover:bg-red-100',
      buttonBg: 'bg-red-500 hover:bg-red-600'
    },
    ishare: {
      name: 'AT - iShare',
      icon: '/atlogo.png',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      hoverBg: 'hover:bg-blue-100',
      buttonBg: 'bg-blue-500 hover:bg-blue-600'
    },
    bigtime: {
      name: 'AT - BigTime',
      icon: '/atlogo.png',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      hoverBg: 'hover:bg-blue-100',
      buttonBg: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const currentNetwork = networkConfig[network.toLowerCase() as keyof typeof networkConfig];

  // Filter products based on user role
  const filteredProducts = products?.filter(product => {
    if (!auth.user) {
      return product.product_type === 'customer_products';
    } else if (auth.user.role === 'customer') {
      return product.product_type === 'customer_products';
    } else if (auth.user.role === 'agent') {
      return product.product_type === 'agent_product';
    } else if (auth.user.role === 'dealer') {
      return product.product_type === 'dealer_product';
    } else if (auth.user.role === 'admin') {
      return product.product_type === 'dealer_product';
    }
    return false;
  }) || [];

  const fetchBundleSizes = async (networkName: string) => {
    setLoadingSizes(true);
    try {
      const response = await fetch(`/api/bundle-sizes?network=${networkName}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSizes(data.sizes);
      } else {
        setAvailableSizes([]);
      }
    } catch (error) {
      console.error('Error fetching bundle sizes:', error);
      setAvailableSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    if (network) {
      fetchBundleSizes(network);
    }
  }, [network]);

  const handleAddSingle = async () => {
    if (!phoneNumber || !bundleSize) return;
    
    if (!auth.user) {
      // Redirect unauthenticated users to login page
      router.visit(route('login'));
      return;
    }
    
    // Handle authenticated user
    router.post(route('add.to.cart'), {
      network: network,
      quantity: bundleSize,
      beneficiary_number: phoneNumber,
    }, {
      onSuccess: () => {
        setPhoneNumber('');
        setBundleSize('');
      },
      onError: (errors) => {
        if (errors.error) {
          alert(errors.error);
        } else {
          alert('An error occurred while adding to cart');
        }
      }
    });
  };

  const handleProcessExcel = async () => {
    if (!excelFile) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', excelFile);
    formData.append('network', network);
    
    try {
      const response = await fetch('/process-excel-to-cart', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setExcelFile(null);
        router.reload();
      } else {
        alert(data.message || 'Failed to process Excel file');
      }
    } catch (error) {
      alert('Error processing Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessBulk = async () => {
    if (!bulkNumbers.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/process-bulk-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          numbers: bulkNumbers,
          network: network
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setBulkNumbers('');
        router.reload();
      } else {
        alert(data.message || 'Failed to process bulk numbers');
      }
    } catch (error) {
      alert('Error processing bulk numbers');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || 
          file.type === 'application/csv' ||
          file.name.endsWith('.csv')) {
        setExcelFile(file);
      } else {
        alert('Please select a valid CSV file (.csv)');
        e.target.value = '';
      }
    }
  };

  const content = (
    <>
      <Head title={`${currentNetwork?.name} Data Bundles`} />

      <div className="min-h-screen bg-gray-50">
        {/* Back button for guests */}
        {!auth.user && (
          <div className="px-4 sm:px-8 pt-6">
            <button
              onClick={() => router.visit(route('data-packages'))}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50g-gray-50 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md mb-6"
            >
              ← Back to Data Packages
            </button>
          </div>
        )}
        
        <div className="px-4 sm:px-8 py-8">

          {/* Product Card - Modern Design */}
          <div className={`bg-white rounded-2xl shadow-lg border-2 ${currentNetwork?.borderColor} overflow-hidden mx-auto ${auth.user ? 'max-w-6xl' : 'max-w-7xl w-full'} transition-all duration-300 hover:shadow-2xl`}>
            {/* Network Header */}
            <div className={`bg-gradient-to-r ${currentNetwork?.gradient} p-8`}>
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                  <img 
                    src={currentNetwork?.icon} 
                    alt={`${currentNetwork?.name} logo`} 
                    className="w-16 h-16 object-contain" 
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{currentNetwork?.name}</h1>
                  <p className="text-white/90 text-lg">Data Bundle Packages</p>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <div className="p-8 space-y-8 bg-white">
              {/* Excel Upload Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <label className="block text-lg font-semibold mb-3 text-gray-800">
                  📄 Upload CSV File
                </label>
                <div className="flex flex-col space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="px-4 py-3 bg-white rounded-lg border border-gray-300 text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Choose File"
                  />
                  <Button 
                    onClick={handleProcessExcel}
                    disabled={!excelFile || isProcessing}
                    className={`px-8 py-3 ${currentNetwork?.buttonBg} text-white rounded-lg font-semibold w-fit transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    {isProcessing ? 'Processing...' : 'Upload CSV'}
                  </Button>
                </div>
              </div>

              {/* Bulk Text Input Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <button 
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className={`px-6 py-3 ${currentNetwork?.buttonBg} text-white rounded-lg font-semibold mb-4 transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  📦 Bulk Text Input Orders
                </button>
                {showBulkInput && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="0241234567 5&#10;0558765432 10&#10;0501234567 3"
                      value={bulkNumbers}
                      onChange={(e) => setBulkNumbers(e.target.value)}
                      rows={4}
                      className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button 
                      onClick={handleProcessBulk}
                      disabled={!bulkNumbers.trim() || isProcessing}
                      className={`px-8 py-3 ${currentNetwork?.buttonBg} text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      {isProcessing ? 'Processing...' : 'Add Bulk to Cart'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Single Order Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">📱 Single Order</h3>
                <div className={`grid gap-6 ${auth.user ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-800">
                      Beneficiary Phone Number <span className="text-red-500">(Required)</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter Beneficiary Number here"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      className="bg-white text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-800">
                      Data Volume <span className="text-red-500">(Required)</span>
                    </label>
                    <Select value={bundleSize} onValueChange={setBundleSize}>
                      <SelectTrigger className="bg-white text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3">
                        <SelectValue placeholder={loadingSizes ? "Loading..." : "Select a package"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label} - GHS {size.price}
                          </SelectItem>
                        ))}
                        {availableSizes.length === 0 && !loadingSizes && (
                          <SelectItem value="no-sizes" disabled>
                            No sizes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-sm text-yellow-800 mt-6">
                  ⚠️ PLEASE VERIFY THE PHONE NUMBER BEFORE PROCEEDING TO AVOID SENDING DATA TO A WRONG NUMBER
                </div>

                <Button 
                  onClick={handleAddSingle}
                  disabled={!phoneNumber || !bundleSize || isProcessing}
                  className={`w-full py-4 ${currentNetwork?.buttonBg} text-white rounded-lg font-bold text-lg mt-6 transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  🛒 Add to Basket
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart Button - Only show for authenticated users */}
        {auth.user && cartCount > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => router.visit('/cart')}
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 rounded-full p-4 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-blue-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
  
  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {content}
      </div>
    );
  }
  
  return (
    <DashboardLayout
      user={auth.user}
      header={
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.visit(route('dashboard'))}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Dashboard
          </button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {currentNetwork?.name} Data Bundles
          </h2>
        </div>
      }
    >
      {content}
    </DashboardLayout>
  );
}