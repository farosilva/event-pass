import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EventList } from './pages/EventList';
import { MyTickets } from './pages/MyTickets';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute = ({ role }: { role?: 'ADMIN' | 'USER' }) => {
    const { user, token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (role && user?.role !== role) return <Navigate to="/" />;
    return <Outlet />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-dark-bg text-gray-100">
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={<EventList />} />

                            {/* User Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/my-tickets" element={<MyTickets />} />
                            </Route>

                            {/* Admin Routes */}
                            <Route element={<ProtectedRoute role="ADMIN" />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                            </Route>
                        </Route>
                    </Routes>
                    <ToastContainer theme="dark" position='bottom-right' />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
