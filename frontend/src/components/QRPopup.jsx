import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';

const QRPopup = ({ onClose }) => {
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('waiting');
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        let eventSource = null;

        const connectSSE = () => {
            // Connect to SSE stream
            eventSource = new EventSource('/user/qr?stream=true');

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('SSE received:', data);

                    if (data.type === 'qr' && data.hasQR) {
                        // QR code tersedia, load gambar
                        setQrImageUrl(`/user/qr?image=true&t=${Date.now()}`);
                        setStatus('ready');
                        setLastUpdate(new Date(data.timestamp));
                    } else if (data.type === 'reset') {
                        // QR code di-reset
                        setQrImageUrl('');
                        setStatus('waiting');
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                eventSource.close();

                // Reconnect after 3 seconds
                setTimeout(() => {
                    console.log('Reconnecting SSE...');
                    connectSSE();
                }, 3000);
            };
        };

        // Check if QR already exists
        fetch('/user/qr?format=json')
            .then(res => res.json())
            .then(data => {
                if (data.hasQR) {
                    setQrImageUrl(`/user/qr?image=true&t=${Date.now()}`);
                    setStatus('ready');
                    setLastUpdate(data.timestamp ? new Date(data.timestamp) : new Date());
                }
            })
            .catch(err => console.error('Error checking QR status:', err));

        connectSSE();

        // Cleanup on unmount
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            // Force refresh QR image
            setQrImageUrl(`/user/qr?image=true&t=${Date.now()}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error refreshing QR:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/20 animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0BBDC7] to-[#0DE7F2] rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">WhatsApp QR Code</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Scan untuk menghubungkan</p>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="px-6 py-8">
                    <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
                        {qrImageUrl ? (
                            <div className="relative">
                                <img
                                    src={qrImageUrl}
                                    alt="WhatsApp QR Code"
                                    className="w-64 h-64 object-contain"
                                    onError={(e) => {
                                        console.error('Error loading QR image');
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="16"%3EError loading QR%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                                {status === 'ready' && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0BBDC7]"></div>
                                    <p className="text-sm text-gray-500">Menunggu QR Code...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="px-6 pb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2 text-sm">Cara Menggunakan:</h4>
                        <ol className="text-sm text-blue-800 space-y-1.5 ml-4 list-decimal">
                            <li>Buka WhatsApp di ponsel Anda</li>
                            <li>Pilih Menu → Perangkat Tertaut</li>
                            <li>Ketuk "Tautkan Perangkat"</li>
                            <li>Arahkan ponsel ke layar ini untuk memindai kode</li>
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading || !qrImageUrl}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors font-medium"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0BBDC7] to-[#0DE7F2] hover:from-[#0aa8b2] hover:to-[#0bd4df] text-white rounded-lg transition-colors font-medium shadow-sm"
                        >
                            Tutup
                        </button>
                    </div>

                    {lastUpdate && (
                        <p className="text-xs text-gray-400 text-center mt-3">
                            Terakhir diperbarui: {lastUpdate.toLocaleTimeString('id-ID')}
                        </p>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default QRPopup;