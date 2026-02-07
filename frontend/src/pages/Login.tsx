import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Senha é obrigatória"),
});

export const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        try {
            const { data } = await api.post('/auth/login', formData);
            login(data.token, data.user);
            toast.success(`Bem-vindo de volta, ${data.user.name}!`);

            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Login falhou';
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-dark-card p-8 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Entrar</h2>
            {error && <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">Email</label>
                    <input
                        type="email"
                        className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">Senha</label>
                    <input
                        type="password"
                        className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded transition-colors"
                >
                    Entrar
                </button>
            </form>
            <p className="mt-4 text-center text-gray-400 text-sm">
                Não tem uma conta? <Link to="/register" className="text-secondary hover:text-white">Registre-se</Link>
            </p>
        </div>
    );
};
