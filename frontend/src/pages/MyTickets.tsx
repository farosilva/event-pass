import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

interface Ticket {
    id: string;
    code: string;
    checkedInAt: string | null;
    event: {
        title: string;
        date: string;
        location: string;
    };
}

export const MyTickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const { data } = await api.get('/tickets/me');
            setTickets(data);
        } catch (err) {
            toast.error('Failed to load tickets');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">My Tickets</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className={`bg-dark-card border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-xl transition-all ${ticket.checkedInAt ? 'opacity-60 grayscale' : 'hover:border-primary/50'}`}
                    >
                        <div className="bg-white p-4 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <QRCodeSVG value={ticket.code} size={128} className={ticket.checkedInAt ? 'opacity-50' : ''} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-primary">{ticket.event.title}</h3>
                            <p className="text-gray-400">{new Date(ticket.event.date).toLocaleDateString()} at {new Date(ticket.event.date).toLocaleTimeString()}</p>
                            <p className="text-gray-400">{ticket.event.location}</p>
                            <div className="mt-4">
                                {ticket.checkedInAt ? (
                                    <div className="flex flex-col gap-2">
                                        <span className="w-fit bg-red-500/20 text-red-500 px-3 py-1 rounded text-sm font-bold border border-red-500/30">
                                            ❌ ALREADY USED
                                        </span>
                                        <p className="text-gray-400">Used at: {new Date(ticket.checkedInAt).toLocaleDateString()} at {new Date(ticket.checkedInAt).toLocaleTimeString()}</p>
                                    </div>
                                ) : (
                                    <span className="w-fit bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm font-bold border border-emerald-500/30">
                                        ✅ VALID
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 font-mono break-all">{ticket.id}</p>
                        </div>
                    </div>
                ))}
            </div>
            {tickets.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    You haven't purchased any tickets yet.
                </div>
            )}
        </div>
    );
};
