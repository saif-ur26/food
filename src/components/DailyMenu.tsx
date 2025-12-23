import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DailyMeal {
  id: string;
  day_of_week: string;
  items: string[];
}

const DailyMenu = () => {
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("daily_meals")
      .select("*");

    if (data) {
      // Sort by day order
      const sorted = data.sort((a, b) => 
        dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
      );
      setMeals(sorted as DailyMeal[]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Weekly Menu
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What's Cooking This Week?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fresh, homemade meals prepared with love every day. Same delicious taste, consistent quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {meals.map((menu) => (
            <div
              key={menu.id}
              className={`rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${
                menu.day_of_week === today
                  ? "ring-2 ring-primary shadow-warm bg-card"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">
                  {menu.day_of_week}
                </h3>
                {menu.day_of_week === today && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {menu.items.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-8 text-sm">
          * Menu items may vary slightly based on availability of fresh ingredients
        </p>
      </div>
    </section>
  );
};

export default DailyMenu;
