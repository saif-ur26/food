import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicMealPlans from "@/components/DynamicMealPlans";
import DailyMenu from "@/components/DailyMenu";
import TodaysMenu from "@/components/TodaysMenu";
import OfferBanner from "@/components/OfferBanner";
import { getPricingPlans } from "@/lib/pricing";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-meals.jpg";
import { ArrowRight, Clock, Leaf, Heart, Truck, Plus, UtensilsCrossed } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Fresh Vegetables & Quality Spices",
    description: "Fresh vegetables & quality spices used daily for authentic home-style cooking",
  },
  {
    icon: Heart,
    title: "Home-Style Cooking",
    description: "Home-style cooking, no restaurant food. Every meal prepared with love and care",
  },
  {
    icon: Clock,
    title: "Daily Delivery: 8:00 PM - 9:00 PM",
    description: "Hot dinner delivered on time every day between 8:00 PM to 9:00 PM, right to your doorstep",
  },
  {
    icon: Truck,
    title: "No Delivery Charges",
    description: "Budget-friendly dinner plans with free home delivery across the city",
  },
];

const Index = () => {
  const [dailyPrice, setDailyPrice] = useState(149);
  const [addOns, setAddOns] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pricing plans
        const plans = await getPricingPlans();
        const dailyPlan = plans.find(plan => plan.plan_type === 'daily');
        if (dailyPlan) {
          setDailyPrice(dailyPlan.current_price);
        }

        // Fetch add-ons
        const { data: addOnsData, error } = await supabase
          .from('add_ons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (!error && addOnsData) {
          setAddOns(addOnsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <OfferBanner />
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative z-10 space-y-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🎉 New Year Special Offer 🎉
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Mamma's Food – Fresh Homemade{" "}
                <span className="text-gradient">Dinner Delivered Daily</span>
              </h1>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-xl p-4 mb-4">
                <p className="text-lg font-bold text-orange-800 mb-2">
                  ₹179 Dinner Meal now at just ₹129
                </p>
                <p className="text-sm text-orange-700">
                  ⏰ Order before 5:00 PM for same-day dinner delivery (8:00 PM - 9:00 PM)
                </p>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience authentic home-style Indian dinner, freshly cooked every evening and delivered hot to your doorstep.
                <br />
                <span className="font-semibold text-foreground">👉 Affordable • Hygienic • Home-Cooked</span>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/order">
                  <Button variant="hero" size="xl">
                    Order Dinner Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:9550043174">
                  <Button variant="outline" size="xl">
                    📞 Call: 9550043174
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Dinner Customers</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4.9★</p>
                  <p className="text-sm text-muted-foreground">Customer Rating</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₹129</p>
                  <p className="text-sm text-muted-foreground">Daily Dinner</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">FREE</p>
                  <p className="text-sm text-muted-foreground">Home Delivery</p>
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
                <p className="text-xs font-medium text-muted-foreground">New Year Offer</p>
                <p className="text-2xl font-bold text-primary">₹129</p>
                <p className="text-sm font-medium text-muted-foreground">Daily Dinner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Mamma's Food for Daily Dinner?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mamma's Food is a reliable homemade dinner delivery service focused only on one thing — fresh, healthy evening meals.
            </p>
          </div>
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

      {/* Delivery Time Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Daily Delivery Time
                </h3>
                <div className="bg-white rounded-xl p-6 mb-4 border border-blue-200">
                  <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    8:00 PM - 9:00 PM
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Every day, including weekends
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Order before 5:00 PM for same-day delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Hot & fresh dinner delivered to your door</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>No delivery charges, completely free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Reliable delivery, 7 days a week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Today's Dinner Menu Section */}
      <TodaysMenu />

      {/* Meal Plans Section */}
      <DynamicMealPlans />

      {/* Add-ons Section */}
      {addOns.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Dinner Add-Ons
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Make your dinner more enjoyable with optional add-ons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {addOns.map((addon, index) => (
                <Card
                  key={addon.id}
                  className="bg-card border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                        {addon.name}
                      </span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        ₹{addon.price}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addon.description && (
                      <p className="text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>✔</span>
                        <span>Can be added to your dinner order</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>✔</span>
                        <span>Available for selected days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Crispy, freshly prepared
                      </div>
                      <Link to="/order">
                        <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Order
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Daily Menu Section */}
      <DailyMenu />

      {/* CTA Section */}
      <section className="py-16 gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready for Fresh Homemade Dinner?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join hundreds of customers who trust Mamma's Food for their daily dinner needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/order">
              <Button variant="accent" size="xl">
                👉 Order Today at ₹129 (New Year Offer)
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:9550043174">
              <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                📞 Call: 9550043174
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
