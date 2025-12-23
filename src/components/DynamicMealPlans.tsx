import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import MealPlanCard from "@/components/MealPlanCard";

interface PricingPlan {
    id: string;
    name: string;
    days: number;
    original_price: number;
    current_price: number;
    plan_type: string;
    is_active: boolean;
}

const DynamicMealPlans = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('pricing_plans')
                .select('*')
                .eq('is_active', true)
                .order('days', { ascending: true });

            if (error) {
                console.error('Error fetching pricing plans:', error);
                return;
            }

            setPlans(data || []);
        } catch (error) {
            console.error('Error fetching pricing plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPlanFeatures = (planType: string, days: number) => {
        const baseFeatures = [
            "Fresh homemade meal",
            "Free delivery",
        ];

        switch (planType) {
            case 'daily':
                return [...baseFeatures, "Order by 5:00 PM"];
            case 'weekly':
                return [...baseFeatures, "Variety menu daily", "Priority delivery", `Save money`];
            case 'monthly':
                return [...baseFeatures, "Maximum savings", "VIP delivery", "Best value"];
            default:
                return baseFeatures;
        }
    };

    if (loading) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-2xl h-96"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (plans.length === 0) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground">No meal plans available at the moment.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
                        Affordable Pricing
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Choose Your Meal Plan
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Select the plan that fits your lifestyle. All plans include fresh, homemade meals
                        with free delivery.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <MealPlanCard
                                name={plan.name}
                                originalPrice={plan.original_price}
                                discountedPrice={plan.current_price}
                                days={plan.days}
                                features={getPlanFeatures(plan.plan_type, plan.days)}
                                isPopular={plan.plan_type === 'weekly'}
                            />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <p className="text-muted-foreground">
                        <span className="text-primary font-semibold">Postpaid Option:</span> Pay 50% advance, remaining on delivery
                    </p>
                </div>
            </div>
        </section>
    );
};

export default DynamicMealPlans;