'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWidget, FAQ, MessageAction } from '@/app/providers/WidgetProvider';
import { X, MessageCircle, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react';


type Message = {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    action?: MessageAction;
};

export default function ChatWidget() {
    const { faqs } = useWidget();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "👋 Hi! Can I help you with anything?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);


    const handleFAQClick = (faq: FAQ) => {
        if (isTyping) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now(),
            text: faq.question,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: Date.now() + 1,
                text: faq.answer,
                sender: 'bot',
                timestamp: new Date(),
                action: faq.action
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-5 right-5 z-50 p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${isOpen ? 'bg-zinc-800 rotate-90' : 'bg-primary hover:bg-sky-400'
                    }`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <X size={20} color="white" />
                ) : (
                    <MessageCircle size={24} color="white" />
                )}
            </button>


            {/* Chat Window - Reduced Size */}
            <div
                className={`fixed bottom-20 right-5 w-[300px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-gray-100 ${isOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
                    }`}
                style={{ maxHeight: '450px' }} // Reduced max-height
            >
                {/* Header - Compact */}
                <div className="bg-primary px-4 py-3 flex items-center gap-2 shadow-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare size={16} color="white" />
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-sm leading-tight">Clinic Support</h3>
                        <p className="text-white/80 text-[10px] flex items-center gap-1">Online</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-3 flex flex-col gap-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                                }`}
                        >
                            <div
                                className={`px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>

                            {/* Attachment / Action Link */}
                            {msg.action && msg.action.type === 'link' && (
                                <div className="mt-1 w-full animate-in fade-in slide-in-from-top-1 duration-300">
                                    <Link
                                        href={msg.action.url}
                                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-accent hover:text-accent p-2 rounded-lg shadow-sm transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                            <ExternalLink size={14} />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-800 group-hover:text-accent">{msg.action.label}</span>
                                            <span className="text-[10px] text-gray-400">Click to open</span>
                                        </div>
                                        <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                </div>
                            )}

                            <span className="text-[9px] text-gray-400 mt-1 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="self-start bg-white border border-gray-100 px-3 py-2.5 rounded-xl rounded-bl-none shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* FAQ Area */}
                <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 ml-1">Quick Help</p>
                    <div className="flex flex-wrap gap-1.5">
                        {faqs.map((faq, index) => (
                            <button
                                key={index}
                                onClick={() => handleFAQClick(faq)}
                                disabled={isTyping}
                                className="text-[11px] bg-slate-50 hover:bg-primary hover:text-white text-slate-600 py-1.5 px-3 rounded-lg transition-all border border-slate-200 active:scale-95 text-left disabled:opacity-50"
                            >
                                {faq.question}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
