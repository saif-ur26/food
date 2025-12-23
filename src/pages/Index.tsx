import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MealPlanCard from "@/components/MealPlanCard";
import DailyMenu from "@/components/DailyMenu";
import heroImage from "@/assets/hero-meals.jpg";
import { ArrowRight, Clock, Leaf, Heart, Truck } from "lucide-react";

const mealPlans = [
  {
    name: "Daily Meal",
    originalPrice: 179,
    discountedPrice: 149,
    days: 1,
    features: [
      "Fresh homemade meal",
      "Dal, Rice, Sabzi, Roti",
      "Free delivery",
      "Order by 4:00 PM",
    ],
  },
  {
    name: "Weekly Plan",
    originalPrice: 1199,
    discountedPrice: 899,
    days: 7,
    features: [
      "7 days of meals",
      "Variety menu daily",
      "Priority delivery",
      "Save ₹300",
    ],
    isPopular: true,
  },
  {
    name: "Monthly Plan",
    originalPrice: 4199,
    discountedPrice: 3839,
    days: 30,
    features: [
      "Full month coverage",
      "Maximum savings",
      "VIP delivery",
      "Save ₹360",
    ],
  },
];

const features = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "We use only the freshest vegetables and spices sourced daily",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every meal is prepared with care, just like home cooking",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "Hot meals delivered right to your doorstep before dinner",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "No delivery charges on all meal plans across the city",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative z-10 space-y-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="w-4 h-4" />
                Order before 4:00 PM for same-day delivery
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Delicious Daily Meals{" "}
                <span className="text-gradient">Delivered Fresh</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience the taste of home with our freshly prepared meals.
                Nutritious, delicious, and delivered right to your doorstep every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/order">
                  <Button variant="hero" size="xl">
                    Order Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="xl">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4.9★</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₹149</p>
                  <p className="text-sm text-muted-foreground">Starting At</p>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-3xl overflow-hidden shadow-warm">
                <img
                  src={heroImage}
                  alt="Delicious Indian thali with dal, rice, sabzi, roti and curd"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"></div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-warm animate-float">
                <p className="text-sm font-medium text-muted-foreground">Today's Special</p>
                <p className="font-display font-bold text-foreground">Dal Tadka + Rice</p>
                <p className="text-primary font-semibold">₹149 only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal Plans Section */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {mealPlans.map((plan, index) => (
              <div
                key={plan.name}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <MealPlanCard {...plan} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Postpaid Option:</span> Pay 50% advance, remaining on delivery (₹179/meal)
            </p>
          </div>
        </div>
      </section>

      {/* Daily Menu Section */}
      <DailyMenu />

      {/* CTA Section */}
      <section className="py-16 gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Enjoy Delicious Home Meals?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join hundreds of happy customers who trust us for their daily meals.
            Order now and taste the difference!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/order">
              <Button variant="accent" size="xl">
                Start Your Order
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:9550043174">
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Call: 9550043174
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
