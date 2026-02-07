import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    availableTickets: number;
}

export const EventList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (err) {
            toast.error('Falha ao carregar eventos');
        }
    };

    const handleBuy = async (eventId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await api.post('/tickets', { eventId });
            toast.success('Ingresso comprado com sucesso!');
            loadEvents(); // Refresh capacity
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Falha na compra');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
                Próximos Eventos
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-dark-card border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-500 transition-all shadow-lg group">
                        <div className="flex flex-col gap-4 p-6 justify-between h-full">
                            <div className="flex flex-col gap-4 h-fit">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors">{event.title}</h2>
                                    <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300">
                                        {new Date(event.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-3">{event.description}</p>
                            </div>

                            <div className="flex flex-col gap-4 h-fit">
                                <div className="flex items-center text-sm text-gray-500 h-fit gap-4">
                                    <span className="w-full">📍 {event.location}</span>
                                    <span>🎟 {event.availableTickets} restantes</span>
                                </div>
                                <button
                                    onClick={() => handleBuy(event.id)}
                                    disabled={event.availableTickets === 0}
                                    className={`w-full py-2 rounded-lg font-medium transition-all ${event.availableTickets === 0
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
                                        }`}
                                >
                                    {event.availableTickets === 0 ? 'Esgotado' : 'Garantir Ingresso'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {events.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    Nenhum evento encontrado. Fique ligado!
                </div>
            )}
        </div>
    );
};
