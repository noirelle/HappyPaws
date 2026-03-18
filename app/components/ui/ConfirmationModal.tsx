import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const colors = {
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        info: 'bg-primary hover:bg-blue-600 text-white'
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-50',
        warning: 'text-amber-500 bg-amber-50',
        info: 'text-blue-500 bg-blue-50'
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <div className={`w-20 h-20 rounded-full ${iconColors[type]} flex items-center justify-center mx-auto mb-6 shadow-inner`}>
                        <AlertTriangle size={36} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">{title}</h2>
                    <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-[1.5] py-4 text-xs font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest ${colors[type]}`}
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
