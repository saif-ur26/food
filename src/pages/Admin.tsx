import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Package, Calendar, CalendarDays, Check, X, LogOut, Loader2, UtensilsCrossed, Plus, Trash2, Save } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  plan_type: "daily" | "weekly" | "fifteen_day" | "monthly";
  payment_type: "prepaid" | "postpaid";
  total_amount: number;
  status: "pending" | "delivered" | "cancelled";
  created_at: string;
}

interface DailyMeal {
  id: string;
  day_of_week: string;
  items: string[];
}

const planLabels: Record<string, string> = {
  daily: "Daily Meal",
  weekly: "Weekly Plan",
  fifteen_day: "15-Day Plan",
  monthly: "Monthly Plan",
};

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [editingMeals, setEditingMeals] = useState<Record<string, string[]>>({});
  const [savingMeals, setSavingMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchOrders();
      fetchMeals();
    } else {
      const { data: existingRoles } = await supabase
        .from("user_roles")
        .select("id")
        .limit(1);

      if (!existingRoles || existingRoles.length === 0) {
        await supabase.from("user_roles").insert({
          user_id: userId,
          role: "admin",
        });
        setIsAdmin(true);
        fetchOrders();
        fetchMeals();
        toast({
          title: "Admin Access Granted",
          description: "You are the first user and have been granted admin access.",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
    setIsLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data as Order[]);
    }
  };

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from("daily_meals")
      .select("*");

    if (data) {
      const sorted = data.sort((a, b) => 
        dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week)
      );
      setMeals(sorted as DailyMeal[]);
      
      const initialEditing: Record<string, string[]> = {};
      sorted.forEach((meal: DailyMeal) => {
        initialEditing[meal.id] = [...meal.items];
      });
      setEditingMeals(initialEditing);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "delivered") => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Update Failed",
        description: "Could not update order status.",
        variant: "destructive",
      });
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    toast({
      title: "Order Updated",
      description: `Order marked as ${newStatus}.`,
    });
  };

  const updateMealItem = (mealId: string, index: number, value: string) => {
    setEditingMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addMealItem = (mealId: string) => {
    setEditingMeals((prev) => ({
      ...prev,
      [mealId]: [...prev[mealId], ""],
    }));
  };

  const removeMealItem = (mealId: string, index: number) => {
    setEditingMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].filter((_, i) => i !== index),
    }));
  };

  const saveMeal = async (mealId: string) => {
    setSavingMeals((prev) => ({ ...prev, [mealId]: true }));

    const items = editingMeals[mealId].filter((item) => item.trim() !== "");

    const { error } = await supabase
      .from("daily_meals")
      .update({ items })
      .eq("id", mealId);

    setSavingMeals((prev) => ({ ...prev, [mealId]: false }));

    if (error) {
      toast({
        title: "Save Failed",
        description: "Could not save meal items.",
        variant: "destructive",
      });
      return;
    }

    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, items } : meal
      )
    );

    toast({
      title: "Menu Updated",
      description: "Meal items saved successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const dailyOrders = orders.filter((o) => o.plan_type === "daily");
  const weeklyOrders = orders.filter((o) => o.plan_type === "weekly" || o.plan_type === "fifteen_day");
  const monthlyOrders = orders.filter((o) => o.plan_type === "monthly");

  const pendingDaily = dailyOrders.filter((o) => o.status === "pending").length;
  const pendingWeekly = weeklyOrders.filter((o) => o.status === "pending").length;
  const pendingMonthly = monthlyOrders.filter((o) => o.status === "pending").length;

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{order.customer_name}</h4>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </div>
          <Badge
            variant={order.status === "delivered" ? "default" : "secondary"}
            className={
              order.status === "delivered"
                ? "bg-secondary text-secondary-foreground"
                : "bg-accent text-accent-foreground"
            }
          >
            {order.status === "delivered" ? "Delivered" : "Pending"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{order.address}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">{planLabels[order.plan_type]}</p>
            <p className="font-semibold text-primary">₹{order.total_amount}</p>
            <p className="text-xs text-muted-foreground capitalize">{order.payment_type}</p>
          </div>
          <div className="flex gap-2">
            {order.status === "pending" ? (
              <Button
                size="sm"
                variant="leaf"
                onClick={() => updateOrderStatus(order.id, "delivered")}
              >
                <Check className="w-4 h-4" />
                Delivered
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateOrderStatus(order.id, "pending")}
              >
                <X className="w-4 h-4" />
                Undo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">HomeMeals Order Management</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingDaily} <span className="text-sm text-muted-foreground">pending</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingWeekly} <span className="text-sm text-muted-foreground">active</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingMonthly} <span className="text-sm text-muted-foreground">active</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="orders" className="data-[state=active]:bg-card">
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-card">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Edit Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Orders Tabs */}
            <Tabs defaultValue="daily" className="space-y-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="daily" className="data-[state=active]:bg-card">
                  Daily ({dailyOrders.length})
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-card">
                  Weekly ({weeklyOrders.length})
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-card">
                  Monthly ({monthlyOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Today's Orders
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dailyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {dailyOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No daily orders yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="weekly" className="space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Active Weekly Subscriptions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {weeklyOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No weekly orders yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Active Monthly Subscriptions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {monthlyOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No monthly orders yet.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Weekly Menu Editor
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit meal items for each day of the week
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {meals.map((meal) => (
                <Card key={meal.id} className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {meal.day_of_week}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingMeals[meal.id]?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateMealItem(meal.id, index, e.target.value)}
                          placeholder="Enter item..."
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeMealItem(meal.id, index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addMealItem(meal.id)}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => saveMeal(meal.id)}
                        disabled={savingMeals[meal.id]}
                        className="flex-1"
                      >
                        {savingMeals[meal.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
