import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { api } from '../services/api';

interface QRScannerProps {
    onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
    const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'error'; message?: string; data?: any }>({ status: 'idle' });
    const [scanning, setScanning] = useState(true);

    const handleScan = async (result: any, _error: any) => {
        if (!scanning) return;

        if (result) {
            setScanning(false);
            const token = result?.text || result; // react-qr-reader versions differ, checking both

            try {
                const { data } = await api.post('/tickets/validate', { token });
                setScanResult({
                    status: 'success',
                    message: 'Ingresso Válido',
                    data: data.ticket
                });

                // Auto reset after 3 seconds for next scan
                setTimeout(() => {
                    setScanResult({ status: 'idle' });
                    setScanning(true);
                }, 3000);

            } catch (err: any) {
                setScanResult({
                    status: 'error',
                    message: err.response?.data?.message || 'Ingresso Inválido'
                });

                // Auto reset after 3 seconds
                setTimeout(() => {
                    setScanResult({ status: 'idle' });
                    setScanning(true);
                }, 3000);
            }
        }
    };

    const [manualCode, setManualCode] = useState('');

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        await handleScan(manualCode, null);
    };

    const bgColor = {
        idle: 'bg-black',
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
    }[scanResult.status] || 'bg-black';

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgColor} transition-colors duration-500`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-10">
                ✕ Fechar
            </button>

            <div className="w-full max-w-sm aspect-square relative mb-6">
                {scanResult.status === 'idle' && (
                    <div className="border-4 border-white/30 rounded-lg overflow-hidden relative h-full">
                        <QrReader
                            onResult={handleScan}
                            constraints={{ facingMode: 'environment' }}
                            className="w-full h-full"
                            containerStyle={{ width: '100%', height: '100%', paddingTop: 0 }}
                            videoStyle={{ objectFit: 'cover' }}
                        />
                        <div className="absolute inset-0 border-2 border-primary animate-pulse opacity-50 pointer-events-none"></div>
                    </div>
                )}
            </div>

            {/* Status Messages */}
            <div className="text-white text-center px-4 mb-6 min-h-[100px]">
                {scanResult.status === 'idle' && (
                    <p className="text-xl animate-bounce">Aponte a câmera para o QR Code</p>
                )}
                {scanResult.status === 'success' && (
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold mb-2">✅ APROVADO</h2>
                        <p className="text-xl">Usuário: {scanResult.data?.user?.email}</p>
                        <p>Evento: {scanResult.data?.event?.title}</p>
                    </div>
                )}
                {scanResult.status === 'error' && (
                    <div>
                        <h2 className="text-4xl font-bold mb-2">❌ NEGADO</h2>
                        <p className="text-xl">{scanResult.message}</p>
                    </div>
                )}
            </div>

            {/* Manual Input Form */}
            {(scanResult.status === 'idle' || scanResult.status === 'error') && (
                <form onSubmit={handleManualSubmit} className="w-full max-w-sm px-8 flex gap-2 z-20">
                    <input
                        type="text"
                        placeholder="Ou digite o código do ingresso..."
                        className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!manualCode}
                        className="bg-white text-black font-bold px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
                    >
                        Verificar
                    </button>
                </form>
            )}
        </div>
    );
};
