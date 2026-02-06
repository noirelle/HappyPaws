'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type MessageAction = {
    type: 'link';
    label: string;
    url: string;
};

export type FAQ = {
    id: string;
    question: string;
    answer: string;
    action?: MessageAction;
};

interface WidgetContextType {
    faqs: FAQ[];
    loading: boolean;
}

const WidgetContext = createContext<WidgetContextType>({
    faqs: [],
    loading: true,
});

export function WidgetProvider({ children }: { children: React.ReactNode }) {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWidgetData = async () => {
            try {
                // Fetch data and ensure minimum loading time for UX
                const [res] = await Promise.all([
                    fetch('/api/widget/faqs'),
                    new Promise(resolve => setTimeout(resolve, 1500))
                ]);

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const mappedFaqs: FAQ[] = data.map((item: any) => ({
                            id: item.id,
                            question: item.question,
                            answer: item.answer,
                            action: (item.action_label && item.action_url) ? {
                                type: 'link',
                                label: item.action_label,
                                url: item.action_url
                            } : undefined
                        }));
                        setFaqs(mappedFaqs);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch widget faqs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWidgetData();
    }, []);

    return (
        <WidgetContext.Provider value={{ faqs, loading }}>
            {children}
        </WidgetContext.Provider>
    );
}

export const useWidget = () => useContext(WidgetContext);
