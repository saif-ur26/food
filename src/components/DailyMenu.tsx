import { Calendar } from "lucide-react";

const weeklyMenu = [
  {
    day: "Monday",
    items: ["Dal Tadka", "Plain Rice", "Curd", "Pickle"],
    color: "bg-terracotta-100",
  },
  {
    day: "Tuesday",
    items: ["Monda Curry", "Jeera Rice", "Raita", "Papad"],
    color: "bg-leaf-100",
  },
  {
    day: "Wednesday",
    items: ["Rajma Masala", "Plain Rice", "Curd", "Salad"],
    color: "bg-golden-100",
  },
  {
    day: "Thursday",
    items: ["Aloo Gobi", "Roti (3)", "Dal Fry", "Pickle"],
    color: "bg-terracotta-100",
  },
  {
    day: "Friday",
    items: ["Paneer Curry", "Jeera Rice", "Raita", "Papad"],
    color: "bg-leaf-100",
  },
  {
    day: "Saturday",
    items: ["Chole Masala", "Bhatura (2)", "Onion Salad", "Pickle"],
    color: "bg-golden-100",
  },
  {
    day: "Sunday",
    items: ["Special Thali", "Rice", "Dal", "Sweet"],
    color: "bg-terracotta-100",
  },
];

const DailyMenu = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

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
          {weeklyMenu.map((menu) => (
            <div
              key={menu.day}
              className={`rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${
                menu.day === today
                  ? "ring-2 ring-primary shadow-warm bg-card"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">
                  {menu.day}
                </h3>
                {menu.day === today && (
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
