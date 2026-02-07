import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo-eventpass-header-transp.png';

export const Layout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col">
            <nav className="bg-dark-card border-b border-gray-700 py-4 px-6 flex justify-between items-center shadow-lg">
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src={logo} alt="EventPass" className="h-10 w-auto" />
                </Link>
                <div className="flex gap-4 items-center">
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
