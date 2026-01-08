import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function DataPackages() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn] = useState(false);

    const handleNetworkClick = (networkId: string) => {
        window.location.href = `/product/${networkId}`;
    };



    const handleDashboardClick = () => {
        window.location.href = '/dashboard';
    };

    const handleRegisterClick = () => {
        window.location.href = '/register';
    };

    const handleLoginClick = () => {
        window.location.href = '/login';
    };

    const networks = [
        {
            id: 'mtn',
            name: 'MTN',
            logo: '/mtnlogo.jpeg',
            gradient: 'from-yellow-400 to-yellow-500',
            bgColor: 'bg-yellow/10',
            textColor: 'text-yellow-600',
            borderColor: 'border-yellow-300',
            hoverBg: 'hover:bg-yellow-50'
        },
        {
            id: 'telecel',
            name: 'Telecel',
            logo: '/telecellogo.png',
            gradient: 'from-red-500 to-red-600',
            bgColor: 'bg-red/10',
            textColor: 'text-red-600',
            borderColor: 'border-red-300',
            hoverBg: 'hover:bg-red-50'
        },
        {
            id: 'ishare',
            name: 'AT - iShare',
            logo: '/atlogo.png',
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue/10',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-300',
            hoverBg: 'hover:bg-blue-50'
        },
        {
            id: 'bigtime',
            name: 'AT - BigTime',
            logo: '/atlogo.png',
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue/10',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-300',
            hoverBg: 'hover:bg-blue-50'
        }
    ];

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background shadow-lg border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3 sm:py-4">
                        <a href="/" className="flex items-center">
                            <img 
                                src='/dataking.jpg' 
                                alt="Dataking Logo" 
                                className="w-32 h-auto rounded-2xl sm:w-40 md:w-48" 
                            />
                        </a>

                        {/* Mobile menu button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden flex items-center px-3 py-2 border rounded text-foreground border-border hover:border-accent focus:outline-none transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>

                        {/* Desktop navigation */}
                        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                            <a 
                                href="/" 
                                className="text-foreground hover:text-accent font-medium transition-colors duration-300 px-3 py-2"
                            >
                                Home
                            </a>
                            <a 
                                href="/data-packages" 
                                className="text-accent font-semibold border-b-2 border-accent pb-1 px-3 py-2"
                            >
                                Data Packages
                            </a>
                            {isLoggedIn ? (
                                <button
                                    onClick={handleDashboardClick}
                                    className="px-4 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent/80 hover:shadow-lg transition-all duration-300 text-sm md:px-6 md:text-base"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={handleRegisterClick}
                                        className="px-4 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent/80 hover:shadow-lg transition-all duration-300 text-sm md:px-6 md:text-base"
                                    >
                                        Register
                                    </button>
                                    <button
                                        onClick={handleLoginClick}
                                        className="px-4 py-2 bg-transparent border-2 border-accent text-accent font-semibold rounded-full hover:bg-accent hover:text-white transition-all duration-300 text-sm md:px-6 md:text-base"
                                    >
                                        Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-border">
                            <div className="flex flex-col space-y-4">
                                <a 
                                    href="/" 
                                    className="text-foreground hover:text-accent font-medium transition-colors duration-300 py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Home
                                </a>
                                <a 
                                    href="/data-packages" 
                                    className="text-accent font-semibold py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Data Packages
                                </a>
                                {isLoggedIn ? (
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleDashboardClick();
                                        }}
                                        className="px-4 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent/80 text-center transition-all duration-300"
                                    >
                                        Dashboard
                                    </button>
                                ) : (
                                    <div className="flex flex-col space-y-3 pt-2">
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleRegisterClick();
                                            }}
                                            className="px-4 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent/80 text-center transition-all duration-300"
                                        >
                                            Register
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleLoginClick();
                                            }}
                                            className="px-4 py-2 bg-transparent border-2 border-accent text-accent font-semibold rounded-full hover:bg-accent hover:text-white text-center transition-all duration-300"
                                        >
                                            Login
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Products Section */}
            <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-background mt-30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Available Networks</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            Select your preferred network to view available data packages and pricing
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {networks.map((network) => (
                            <div 
                                key={network.id}
                                onClick={() => handleNetworkClick(network.id)}
                                className={`group cursor-pointer bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-border hover:bg-accent/5`}
                            >
                                <div className="flex flex-col items-center space-y-6 h-full justify-between">
                                    {/* Logo Container */}
                                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${network.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <img 
                                            src={network.logo}
                                            alt={network.name} 
                                            className="w-16 h-16 object-contain" 
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="text-center flex-grow">
                                        <h4 className="text-2xl font-bold text-gray-800 mb-2">{network.name}</h4>
                                        <p className="text-gray-600 text-sm mb-4">Data Bundles</p>
                                    </div>

                                    {/* Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNetworkClick(network.id);
                                        }}
                                        className={`w-full px-6 py-3 bg-gradient-to-r ${network.gradient} text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group/btn`}
                                    >
                                        <span>View Packages</span>
                                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>




        </div>
    );
}