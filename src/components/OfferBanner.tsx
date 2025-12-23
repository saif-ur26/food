import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { X } from "lucide-react";

interface Offer {
    id: string;
    name: string;
    description: string;
}

const OfferBanner = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    useEffect(() => {
        if (offers.length > 1) {
            const interval = setInterval(() => {
                setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
            }, 4000); // Change offer every 4 seconds

            return () => clearInterval(interval);
        }
    }, [offers.length]);

    const fetchOffers = async () => {
        try {
            const { data, error } = await supabase
                .from('offers')
                .select('id, name, description')
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching offers:', error);
                return;
            }

            setOffers(data || []);
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    if (!isVisible || offers.length === 0) {
        return null;
    }

    const currentOffer = offers[currentOfferIndex];

    return (
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-4 relative overflow-hidden shadow-lg">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex-1 text-center">
                    <div className="animate-bounce">
                        <span className="font-bold text-base md:text-lg tracking-wide">
                            🎉 {currentOffer.name}
                            {currentOffer.description && (
                                <span className="ml-2 opacity-95 font-medium">- {currentOffer.description}</span>
                            )}
                            <span className="ml-2 animate-pulse">✨ Order Now!</span>
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors border border-white/30"
                    aria-label="Close banner"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Enhanced animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
    );
};

export default OfferBanner;