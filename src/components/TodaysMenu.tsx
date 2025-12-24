import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DailyMeal {
    id: string;
    day_of_week: string;
    items: string[];
}

const TodaysMenu = () => {
    const [todaysMenu, setTodaysMenu] = useState<DailyMeal | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    useEffect(() => {
        fetchTodaysMenu();
    }, []);

    const fetchTodaysMenu = async () => {
        try {
            const { data, error } = await supabase
                .from("daily_meals")
                .select("*")
                .eq("day_of_week", today)
                .single();

            if (error) {
                console.error('Error fetching today\'s menu:', error);
                setIsLoading(false);
                return;
            }

            if (data) {
                setTodaysMenu(data as DailyMeal);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fallback menu items if no data found
    const fallbackMenu = [
        "Jeera Rice",
        "Moong Dal",
        "Aloo Gobi",
        "Chapati",
        "Fresh Curd"
    ];

    const menuItems = todaysMenu?.items || fallbackMenu;

    // Map menu items to emojis and descriptions
    const getItemDetails = (item: string) => {
        const itemLower = item.toLowerCase();

        if (itemLower.includes('rice')) {
            return { emoji: '🍚', description: 'Aromatic & fluffy' };
        } else if (itemLower.includes('dal')) {
            return { emoji: '🍲', description: 'Protein-rich lentils' };
        } else if (itemLower.includes('aloo') || itemLower.includes('potato')) {
            return { emoji: '🥘', description: 'Spiced vegetables' };
        } else if (itemLower.includes('gobi') || itemLower.includes('cauliflower')) {
            return { emoji: '🥘', description: 'Fresh cauliflower' };
        } else if (itemLower.includes('chapati') || itemLower.includes('roti')) {
            return { emoji: '🫓', description: 'Fresh & soft' };
        } else if (itemLower.includes('curd') || itemLower.includes('yogurt')) {
            return { emoji: '🥛', description: 'Homemade yogurt' };
        } else if (itemLower.includes('chicken')) {
            return { emoji: '🍗', description: 'Tender & juicy' };
        } else if (itemLower.includes('paneer')) {
            return { emoji: '🧀', description: 'Fresh cottage cheese' };
        } else {
            return { emoji: '🍽️', description: 'Delicious & fresh' };
        }
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Loading today's menu...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        📅 Today's Menu - {todayDate}
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                        What's Cooking Today?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Fresh homemade dinner prepared today - {today}'s special menu with authentic flavors.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                                {menuItems.slice(0, 5).map((item, index) => {
                                    const { emoji, description } = getItemDetails(item);
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                                <span className="text-2xl">{emoji}</span>
                                            </div>
                                            <h3 className="font-semibold text-foreground">{item}</h3>
                                            <p className="text-xs text-muted-foreground">{description}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Show additional items if more than 5 */}
                            {menuItems.length > 5 && (
                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <h4 className="text-center font-semibold text-foreground mb-3">Additional Items:</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {menuItems.slice(5).map((item, index) => (
                                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-border/50">
                                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Fresh ingredients
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                        Cooked today
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Delivered hot
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default TodaysMenu;