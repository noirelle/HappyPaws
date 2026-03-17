'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ConfirmationModal from '../../../../components/ui/ConfirmationModal';


type FAQ = {
    id: string;
    question: string;
    answer: string;
    created_at: string;
    action_label?: string;
    action_url?: string;
};

export default function WidgetPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState<Partial<FAQ>>({});
    const [saving, setSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await fetch('/api/widget/faqs');
            if (res.ok) {
                const data = await res.json();
                // If data is array
                if (Array.isArray(data)) {
                    setFaqs(data);
                } else {
                    console.error('Expected array of FAQs');
                }
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = currentFaq.id ? 'PUT' : 'POST';
            const res = await fetch('/api/widget/faqs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFaq),
            });

            if (res.ok) {
                fetchFaqs();
                setIsModalOpen(false);
                setCurrentFaq({});
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setFaqToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!faqToDelete) return;
        try {
            const res = await fetch(`/api/widget/faqs?id=${faqToDelete}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setFaqs(faqs.filter(f => f.id !== faqToDelete));
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setFaqToDelete(null);
        }
    };

    const openModal = (faq?: FAQ) => {
        setCurrentFaq(faq || {});
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-end">
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add FAQ
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
                </div>

                {loading ? (
                    <FAQSkeleton />
                ) : faqs.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No FAQs found. Create one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto text-left">
                        <table className="w-full text-sm text-gray-600">
                            <thead className="bg-[#F8F9FB] text-gray-500 font-medium border-y border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Question</th>
                                    <th className="px-6 py-4">Answer</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {faqs.map((faq) => (
                                    <tr key={faq.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 font-medium text-gray-900 w-1/3">{faq.question}</td>
                                        <td className="px-6 py-5 w-1/3 text-gray-600">{faq.answer}</td>
                                        <td className="px-6 py-5">
                                            {faq.action_label && faq.action_url ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    {faq.action_label}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(faq)}
                                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(faq.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                {currentFaq.id ? 'Edit FAQ' : 'Add New FAQ'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>

                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={currentFaq.question || ''}
                                    onChange={e => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                                    placeholder="e.g., How do I book?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    value={currentFaq.answer || ''}
                                    onChange={e => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                    placeholder="Enter the answer here..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                <div className="col-span-1 sm:col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Call to Action (Optional)</h4>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={currentFaq.action_label || ''}
                                        onChange={e => setCurrentFaq({ ...currentFaq, action_label: e.target.value })}
                                        placeholder="e.g. Book Now"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Route</label>
                                    <div className="relative">
                                        <input
                                            list="available-routes"
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={currentFaq.action_url || ''}
                                            onChange={e => setCurrentFaq({ ...currentFaq, action_url: e.target.value })}
                                            placeholder="/path/to/page"
                                        />
                                        <datalist id="available-routes">
                                            <option value="/book" />
                                            <option value="/login" />
                                            <option value="/services" />
                                            <option value="/contact" />
                                        </datalist>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete FAQ"
                message="Are you sure you want to delete this frequently asked question? This action cannot be undone."
                confirmText="Delete FAQ"
            />
        </div>
    );
}

function FAQSkeleton() {
    return (
        <div className="divide-y divide-gray-100 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-6 px-6 py-5">
                    <div className="w-1/3 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                    </div>
                    <div className="w-1/3 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <div className="h-8 w-16 bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
