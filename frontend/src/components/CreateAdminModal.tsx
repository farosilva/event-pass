import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface Props {
    onClose: () => void;
}

export const CreateAdminModal = ({ onClose }: Props) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/admin', formData);
            toast.success('Admin criado com sucesso');
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Falha ao criar admin');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-gray-700 p-8 rounded-xl shadow-2xl max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white">Convidar Novo Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Nome</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded transition-colors mt-4"
                    >
                        Criar Conta Admin
                    </button>
                </form>
            </div>
        </div>
    );
};
