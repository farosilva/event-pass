import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo-eventpass-header-transp.png';
import { Bars3Icon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline';

export const Layout = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when route changes
    if (isMenuOpen) {
        // Simple way to ensure menu closes on navigation without useEffect overhead if preferred, 
        // but let's use a click handler on links instead or just letting it stay open? 
        // Better UX is to close it. Let's add onClick to links.
    }

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col">
            <nav className="bg-dark-card border-b border-gray-700 py-4 px-6 relative shadow-lg z-50">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity" onClick={closeMenu}>
                        <img src={logo} alt="EventPass" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-4 items-center">
                        {user ? (
                            <>
                                <span className="text-gray-400">Olá, {user.name}</span>
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Painel</Link>
                                )}
                                {user.role === 'USER' && (
                                    <Link to="/my-tickets" className="text-gray-300 hover:text-white transition-colors">Meus Ingressos</Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="bg-danger hover:bg-danger-hover text-white px-4 py-2 rounded-md transition-colors font-medium text-sm"
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">Entrar</Link>
                                <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors font-medium text-sm">
                                    Cadastrar
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation Controls */}
                    <div className="flex items-center gap-4 md:hidden">
                        {/* Mobile Ticket Icon (Only for logged users) */}
                        {user && user.role === 'USER' && (
                            <Link
                                to="/my-tickets"
                                className="text-gray-300 hover:text-emerald-400 transition-colors p-1"
                                onClick={closeMenu}
                                aria-label="Meus Ingressos"
                            >
                                <TicketIcon className="h-7 w-7" />
                            </Link>
                        )}

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none p-1"
                            aria-label="Abrir menu"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="h-8 w-8" />
                            ) : (
                                <Bars3Icon className="h-8 w-8" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-dark-card border-b border-gray-700 shadow-xl py-4 px-6 md:hidden flex flex-col gap-4 animate-fade-in-down">
                        {user ? (
                            <>
                                <div className="text-gray-400 border-b border-gray-700 pb-2 mb-2">
                                    Olá, <span className="text-white font-medium">{user.name}</span>
                                </div>
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" onClick={closeMenu} className="text-gray-300 hover:text-white transition-colors py-2 block">
                                        Painel Administrativo
                                    </Link>
                                )}
                                {user.role === 'USER' && (
                                    <Link to="/my-tickets" onClick={closeMenu} className="text-gray-300 hover:text-white transition-colors py-2 flex items-center gap-2">
                                        <TicketIcon className="h-5 w-5" />
                                        Meus Ingressos
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-danger hover:bg-danger-hover text-white px-4 py-2 rounded-md transition-colors font-medium text-sm w-full text-center mt-2"
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={closeMenu} className="text-gray-300 hover:text-primary transition-colors py-2 block text-center border-b border-gray-700 pb-2">
                                    Entrar
                                </Link>
                                <Link to="/register" onClick={closeMenu} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md transition-colors font-medium text-sm w-full text-center block mt-2">
                                    Cadastrar
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
            <main className="flex-1 container mx-auto p-6">
                <Outlet />
            </main>
            <footer className="bg-dark-card border-t border-gray-700 py-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} EventPass. Todos os direitos reservados.
            </footer>
        </div>
    );
};
