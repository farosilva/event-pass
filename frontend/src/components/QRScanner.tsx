import React, { useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { api } from '../services/api';
import { jwtDecode } from "jwt-decode";

interface QRScannerProps {
    onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
    const [scanResult, setScanResult] = useState<{ status: 'idle' | 'success' | 'error' | 'loading'; message?: string; data?: any }>({ status: 'idle' });
    const [manualCode, setManualCode] = useState('');
    const [scannedEventTitle, setScannedEventTitle] = useState<string | null>(null);
    const isProcessing = useRef(false);

    const handleScan = async (result: any, error: any) => {
        const goAhead = (!!result && !error)
        const qrcodeIsInProcess = isProcessing?.current

        if (qrcodeIsInProcess || !goAhead) return;

        setScanResult({ status: 'loading' });
        isProcessing.current = true;
        setScannedEventTitle(null); // Reset title

        const token = result?.text as string || result as string;

        // Try to decode JWT to get event title immediately
        try {
            const decoded: any = jwtDecode(token);
            if (decoded?.eventTitle) {
                setScannedEventTitle(decoded.eventTitle);
            }
        } catch (e) {
            // Ignore decoding errors, might be a legacy code or invalid
            console.log("Could not decode QR token for preview", e);
        }

        try {
            const { data } = await api.post('/tickets/validate', { token });
            setScanResult({
                status: 'success',
                message: 'Ingresso Válido',
                data: data.ticket
            });
        } catch (err: any) {
            setScanResult({
                status: 'error',
                message: err.response?.data?.message || 'Ingresso Inválido'
            });
        } finally {
            setTimeout(() => {
                setScanResult({ status: 'idle' });
                setScannedEventTitle(null);
                isProcessing.current = false;
            }, 2000);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const qrcodeIsInProcess = isProcessing?.current

        if (!manualCode.trim() || qrcodeIsInProcess) return;
        await handleScan(manualCode, null);
    };

    const bgColor = {
        idle: 'bg-black',
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
        loading: 'bg-yellow-600',
    }[scanResult.status] || 'bg-black';

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgColor} transition-colors duration-500`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-10">
                ✕ Fechar
            </button>

            <div className="w-full max-w-sm aspect-square relative mb-6">
                <div style={{ visibility: scanResult.status === 'idle' ? 'visible' : 'hidden' }} className="border-4 border-white/30 rounded-lg overflow-hidden relative h-full">
                    <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: 'environment' }}
                        className="w-full h-full"
                        containerStyle={{ width: '100%', height: '100%', paddingTop: 0 }}
                        videoStyle={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 border-2 border-primary animate-pulse opacity-50 pointer-events-none"></div>
                </div>

                {/* Spinner on status loading */}
                {scanResult.status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        {scannedEventTitle && (
                            <div className="text-center px-4 animate-pulse">
                                <p className="text-sm opacity-80">Validando ingresso para:</p>
                                <p className="text-xl font-bold">{scannedEventTitle}</p>
                            </div>
                        )}
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
                        <p className="text-xl">Usuário: {scanResult.data?.user?.name}</p>
                        <p className="text-xl">Email: {scanResult.data?.user?.email}</p>
                        <p>Evento: {scanResult.data?.event?.name}</p>
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
