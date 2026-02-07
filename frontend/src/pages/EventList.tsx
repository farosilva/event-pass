import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getRegionByLocation } from '../utils/regions';

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
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const loadEvents = useCallback(async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch {
            toast.error('Falha ao carregar eventos');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        loadEvents();
    }, [loadEvents]);

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

    const filteredAndGroupedEvents = useMemo(() => {
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const grouped: Record<string, Event[]> = {};

        filtered.forEach(event => {
            const region = getRegionByLocation(event.location);
            if (!grouped[region]) {
                grouped[region] = [];
            }
            grouped[region].push(event);
        });

        // Sort regions to ensure consistent order if needed, or keeping insertion order
        const regionOrder = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Outros'];
        const sortedGrouped: Record<string, Event[]> = {};

        regionOrder.forEach(region => {
            if (grouped[region] && grouped[region].length > 0) {
                sortedGrouped[region] = grouped[region];
            }
        });

        // Add any regions not in the predefined order (shouldn't happen with getRegionByLocation logic but safe to have)
        Object.keys(grouped).forEach(region => {
            if (!regionOrder.includes(region)) {
                sortedGrouped[region] = grouped[region];
            }
        });

        return sortedGrouped;
    }, [events, searchTerm]);

    return (
        <div className="space-y-8 min-h-screen">
            {/* Header & Creative Search */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 animate-pulse">
                    Próximos Eventos
                </h1>

                <div className="relative group w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar eventos, cidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-full leading-5 bg-gray-800/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all duration-300 shadow-lg backdrop-blur-sm group-hover:bg-gray-800/80"
                    />
                </div>
            </div>

            {/* Event List Grouped by Region */}
            {Object.keys(filteredAndGroupedEvents).length === 0 ? (
                <div className="text-center text-gray-500 py-20 bg-gray-800/30 rounded-3xl border border-gray-700/30 backdrop-blur-sm">
                    <p className="text-xl">Nenhum evento encontrado para sua busca. 🕵️‍♂️</p>
                    <p className="text-sm mt-2">Tente buscar por outro termo ou região.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(filteredAndGroupedEvents).map(([region, regionEvents]) => (
                        <div key={region} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-gray-200 tracking-wide uppercase border-l-4 border-emerald-500 pl-4">
                                    {region}
                                </h2>
                                <div className="h-px bg-gray-700 flex-grow opacity-50"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {regionEvents.map((event) => (
                                    <div key={event.id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
                                        <div className="flex flex-col h-full bg-gradient-to-b from-transparent to-gray-900/50">
                                            {/* Date Badge */}
                                            <div className="p-6 pb-0 flex justify-end">
                                                <span className="bg-gray-700/80 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full text-emerald-300 border border-gray-600/50 shadow-sm">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="p-6 flex flex-col gap-4 flex-grow">
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto pt-4 space-y-4">
                                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>📍</span>
                                                            <span className="truncate max-w-[150px]" title={event.location}>{event.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-medium text-gray-400">
                                                            <span>🎟</span>
                                                            <span>{event.availableTickets} tickets</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleBuy(event.id)}
                                                        disabled={event.availableTickets === 0}
                                                        className={`w-full py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${event.availableTickets === 0
                                                            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-transparent'
                                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-400/20'
                                                            }`}
                                                    >
                                                        {event.availableTickets === 0 ? (
                                                            <span>Esgotado</span>
                                                        ) : (
                                                            <>
                                                                <span>Garantir Ingresso</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
