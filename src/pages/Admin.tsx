import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Package, Calendar, CalendarDays, Check, X, Loader2, UtensilsCrossed, Plus, Trash2, Save, Lock } from "lucide-react";
import { Label } from "recharts";
import { Label } from "recharts";

// (Keep the interfaces and constants from the original file)
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

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [editingMeals, setEditingMeals] = useState<Record<string, string[]>>({});
  const [savingMeals, setSavingMeals] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
      await fetchMeals();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  const fetchMeals = async () => {
    const { data, error } = await supabase.from("daily_meals").select("*");
    if (data) {
      const sorted = data.sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week));
      setMeals(sorted as DailyMeal[]);
      const initialEditing = sorted.reduce((acc, meal) => ({ ...acc, [meal.id]: [...meal.items] }), {});
      setEditingMeals(initialEditing);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "delivered") => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast({ title: "Update Failed", description: "Could not update order status.", variant: "destructive" });
      return;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Order Updated", description: `Order marked as ${newStatus}.` });
  };

  const updateMealItem = (mealId: string, index: number, value: string) => {
    setEditingMeals(prev => ({ ...prev, [mealId]: prev[mealId].map((item, i) => i === index ? value : item) }));
  };

  const addMealItem = (mealId: string) => {
    setEditingMeals(prev => ({ ...prev, [mealId]: [...prev[mealId], ""] }));
  };

  const removeMealItem = (mealId: string, index: number) => {
    setEditingMeals(prev => ({ ...prev, [mealId]: prev[mealId].filter((_, i) => i !== index) }));
  };

  const saveMeal = async (mealId: string) => {
    setSavingMeals(prev => ({ ...prev, [mealId]: true }));
    const items = editingMeals[mealId].filter(item => item.trim() !== "");
    const { error } = await supabase.from("daily_meals").update({ items }).eq("id", mealId);
    setSavingMeals(prev => ({ ...prev, [mealId]: false }));
    if (error) {
      toast({ title: "Save Failed", description: "Could not save meal items.", variant: "destructive" });
      return;
    }
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, items } : m));
    toast({ title: "Menu Updated", description: "Meal items saved successfully." });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const dailyOrders = orders.filter(o => o.plan_type === "daily");
  const weeklyOrders = orders.filter(o => o.plan_type === "weekly" || o.plan_type === "fifteen_day");
  const monthlyOrders = orders.filter(o => o.plan_type === "monthly");
  const pendingDaily = dailyOrders.filter(o => o.status === "pending").length;
  const pendingWeekly = weeklyOrders.filter(o => o.status === "pending").length;
  const pendingMonthly = monthlyOrders.filter(o => o.status === "pending").length;

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{order.customer_name}</h4>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </div>
          <Badge variant={order.status === "delivered" ? "default" : "secondary"} className={order.status === "delivered" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"}>
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
              <Button size="sm" variant="leaf" onClick={() => updateOrderStatus(order.id, "delivered")}>
                <Check className="w-4 h-4" /> Delivered
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "pending")}>
                <X className="w-4 h-4" /> Undo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
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
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Stats Cards */}
        </div>
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Edit Menu</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="space-y-6">
            <Tabs defaultValue="daily" className="space-y-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="daily">Daily ({dailyOrders.length})</TabsTrigger>
                <TabsTrigger value="weekly">Weekly ({weeklyOrders.length})</TabsTrigger>
                <TabsTrigger value="monthly">Monthly ({monthlyOrders.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dailyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
              </TabsContent>
              <TabsContent value="weekly" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeklyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="menu" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {meals.map(meal => (
                <Card key={meal.id} className="bg-card border-border">
                  <CardHeader><CardTitle>{meal.day_of_week}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {editingMeals[meal.id]?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={item} onChange={e => updateMealItem(meal.id, index, e.target.value)} />
                        <Button size="icon" variant="ghost" onClick={() => removeMealItem(meal.id, index)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => addMealItem(meal.id)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                      <Button size="sm" variant="hero" onClick={() => saveMeal(meal.id)} disabled={savingMeals[meal.id]}>
                        {savingMeals[meal.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Save</>}
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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // This is the correct, secure password. In a real app, use an env variable.
  const ADMIN_PASSWORD = "safe@100";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Debug logging
    console.log("Entered password:", password);
    console.log("Expected password:", ADMIN_PASSWORD);
    console.log("Password length:", password.length);
    console.log("Expected length:", ADMIN_PASSWORD.length);
    console.log("Passwords match:", password === ADMIN_PASSWORD);

    // Trim whitespace and compare
    const trimmedPassword = password.trim();
    const trimmedExpected = ADMIN_PASSWORD.trim();

    if (trimmedPassword === trimmedExpected) {
      setIsAuthenticated(true);
      toast({ title: "Access Granted", description: "Welcome, Admin!" });
    } else {
      toast({
        title: "Access Denied",
        description: `Incorrect password. Expected: "${ADMIN_PASSWORD}"`,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border shadow-warm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Access</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">Enter the password to continue</p>
          <p className="text-xs text-blue-600 mt-1">Expected: safe@100</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="admin-password">Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              {showPassword && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current input: "{password}"
                </p>
              )}
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
