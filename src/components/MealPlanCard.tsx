import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface MealPlanCardProps {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  days: number;
  features: string[];
  isPopular?: boolean;
}

const MealPlanCard = ({
  name,
  originalPrice,
  discountedPrice,
  days,
  features,
  isPopular = false,
}: MealPlanCardProps) => {
  const savings = originalPrice - discountedPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 ${
        isPopular
          ? "bg-primary text-primary-foreground shadow-warm scale-105"
          : "bg-card border border-border shadow-soft hover:shadow-warm"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold mb-2">{name}</h3>
        <p className={`text-sm ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {days} {days === 1 ? "Day" : "Days"}
        </p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className={`text-lg line-through ${isPopular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            ₹{originalPrice}
          </span>
          <X className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold font-display">₹{discountedPrice}</span>
        </div>
        <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          isPopular ? "bg-primary-foreground/20" : "bg-secondary/20 text-secondary"
        }`}>
          <Check className="w-4 h-4" />
          Save ₹{savings} ({savingsPercent}% off)
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isPopular ? "bg-primary-foreground/20" : "bg-secondary/20"
            }`}>
              <Check className={`w-3 h-3 ${isPopular ? "text-primary-foreground" : "text-secondary"}`} />
            </div>
            <span className={`text-sm ${isPopular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link to={`/order?plan=${name.toLowerCase().replace(" ", "-")}`}>
        <Button
          variant={isPopular ? "accent" : "hero"}
          size="lg"
          className="w-full"
        >
          Choose {name}
        </Button>
      </Link>
    </div>
  );
};

export default MealPlanCard;
