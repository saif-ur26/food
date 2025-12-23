import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.tsx";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, UtensilsCrossed, Phone, MapPin, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  plan_type: Database["public"]["Enums"]["plan_type"];
  payment_type: Database["public"]["Enums"]["payment_type"];
  total_amount: number;
  status: Database["public"]["Enums"]["order_status"];
  created_at: string;
}

interface DailyMeal {
  id: string;
  day_of_week: string;
  items: string[];
}

const OrderStatus = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchMeals();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders.",
        variant: "destructive",
      });
      return;
    }

    setOrders(data as Order[]);
    setIsLoading(false);
  };

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("daily_meals")
      .select("*");

    if (error) {
      console.error("Error fetching meals:", error);
      return;
    }

    if (data) {
      const sorted = data.sort((a, b) =>
        dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
      );
      setMeals(sorted as DailyMeal[]);
    }
  };

  const getTodaysMenu = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return meals.find(meal => meal.day_of_week === today);
  };

  const getWeeklyMenu = () => {
    return meals;
  };

  const getRemainingDays = (order: Order) => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    let totalDays = 1;
    if (order.plan_type === 'weekly') totalDays = 7;
    else if (order.plan_type === 'monthly') totalDays = 30;

    const remainingDays = Math.max(0, totalDays - daysPassed);
    return { remainingDays, totalDays, daysPassed };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'daily': return 'Daily Meal';
      case 'weekly': return 'Weekly Plan';
      case 'monthly': return 'Monthly Plan';
      default: return 'Meal Plan';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground">You need to login to view your order status.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const todaysMenu = getTodaysMenu();
  const weeklyMenu = getWeeklyMenu();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Orders
            </h1>
            <p className="text-muted-foreground">
              Track your meal subscriptions and view today's menu
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Start by ordering your first meal!
                </p>
                <Button variant="hero" onClick={() => window.location.href = '/order'}>
                  Place Your First Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Today's Menu Section */}
              {todaysMenu && (
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                      Today's Menu - {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {todaysMenu.items.map((item, index) => (
                        <div
                          key={index}
                          className="bg-background/80 rounded-lg p-3 text-center border border-border/50"
                        >
                          <span className="text-sm font-medium text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Orders List */}
              <div className="grid gap-6">
                {orders.map((order) => {
                  const { remainingDays, totalDays, daysPassed } = getRemainingDays(order);
                  const isActive = order.status === 'pending' && remainingDays > 0;
                  const isMultiDay = order.plan_type === 'weekly' || order.plan_type === 'monthly';

                  return (
                    <Card key={order.id} className="bg-card border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              {getPlanLabel(order.plan_type)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Order placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Order Details */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{order.phone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{order.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm capitalize">{order.payment_type}</span>
                              <span className="text-sm font-semibold">₹{order.total_amount}</span>
                            </div>
                          </div>

                          {/* Subscription Progress for Multi-day Plans */}
                          {isMultiDay && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">
                                  Day {daysPassed + 1} of {totalDays}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, ((daysPassed + 1) / totalDays) * 100)}%` }}
                                ></div>
                              </div>
                              {isActive && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {remainingDays} days remaining
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Weekly Menu for Multi-day Plans */}
                        {isMultiDay && isActive && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <UtensilsCrossed className="w-4 h-4" />
                              Your Weekly Menu
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                              {weeklyMenu.map((menu) => {
                                const isToday = menu.day_of_week === new Date().toLocaleDateString("en-US", { weekday: "long" });
                                return (
                                  <div
                                    key={menu.id}
                                    className={`rounded-lg p-3 border ${isToday
                                        ? "ring-2 ring-primary bg-primary/5 border-primary"
                                        : "border-border bg-muted/30"
                                      }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-sm">{menu.day_of_week}</h5>
                                      {isToday && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                          Today
                                        </span>
                                      )}
                                    </div>
                                    <ul className="space-y-1">
                                      {menu.items.slice(0, 3).map((item, index) => (
                                        <li key={index} className="text-xs text-muted-foreground">
                                          • {item}
                                        </li>
                                      ))}
                                      {menu.items.length > 3 && (
                                        <li className="text-xs text-muted-foreground">
                                          +{menu.items.length - 3} more
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderStatus;