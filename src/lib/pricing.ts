// Pricing and offers management
import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
    id: string;
    name: string;
    days: number;
    original_price: number;
    current_price: number;
    plan_type: 'daily' | 'weekly' | 'monthly';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Offer {
    id: string;
    name: string;
    description: string;
    discount_percentage: number;
    discount_amount: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
    applicable_plans: string[];
    created_at: string;
    updated_at: string;
}

// Get all pricing plans
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
    const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('days', { ascending: true });

    if (error) {
        console.error('Error fetching pricing plans:', error);
        return [];
    }

    return data || [];
};

// Get active offers
export const getActiveOffers = async (): Promise<Offer[]> => {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching offers:', error);
        return [];
    }

    return data || [];
};

// Update pricing plan
export const updatePricingPlan = async (id: string, updates: Partial<PricingPlan>) => {
    const { data, error } = await supabase
        .from('pricing_plans')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update pricing plan: ${error.message}`);
    }

    return data;
};

// Create or update offer
export const upsertOffer = async (offer: Partial<Offer>) => {
    const { data, error } = await supabase
        .from('offers')
        .upsert({
            ...offer,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to save offer: ${error.message}`);
    }

    return data;
};

// Calculate discounted price
export const calculateDiscountedPrice = (originalPrice: number, offer: Offer): number => {
    if (offer.discount_percentage > 0) {
        return Math.round(originalPrice * (1 - offer.discount_percentage / 100));
    } else if (offer.discount_amount > 0) {
        return Math.max(0, originalPrice - offer.discount_amount);
    }
    return originalPrice;
};

// Get today's menu
export const getTodayMenu = async (): Promise<string[]> => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const { data, error } = await supabase
        .from('daily_meals')
        .select('items')
        .eq('day_of_week', today)
        .single();

    if (error) {
        console.error('Error fetching today menu:', error);
        return [];
    }

    return data?.items || [];
};