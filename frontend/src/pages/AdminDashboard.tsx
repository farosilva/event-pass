import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { QRScanner } from '../components/QRScanner';

import { CreateAdminModal } from '../components/CreateAdminModal';

export const AdminDashboard = () => {
    const [showScanner, setShowScanner] = useState(false);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        totalTickets: 0,
    });

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/events', eventData);
            toast.success('Event created successfully');
            setEventData({ title: '', description: '', date: '', location: '', totalTickets: 0 });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        }
    };

    return (
        <div className="space-y-8">
            {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}
            {showCreateAdmin && <CreateAdminModal onClose={() => setShowCreateAdmin(false)} />}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateAdmin(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                    >
                        <span>👤</span> New Admin
                    </button>
                    <button
                        onClick={() => setShowScanner(true)}
                        className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-secondary/20 flex items-center gap-2 transition-all"
                    >
                        <span>📷</span> Scan Tickets
                    </button>
                </div>
            </div>

            <div className="bg-dark-card border border-gray-700 p-8 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-200">Create New Event</h2>
                <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-400 mb-1 text-sm">Event Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-secondary"
                            placeholder="e.g. Summer Festival 2024"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-400 mb-1 text-sm">Description</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-secondary"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-secondary"
                            value={eventData.date}
                            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Location</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-secondary"
                            placeholder="e.g. Convention Center"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Total Tickets</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full bg-dark-input border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-secondary"
                            value={eventData.totalTickets}
                            onChange={(e) => setEventData({ ...eventData, totalTickets: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
