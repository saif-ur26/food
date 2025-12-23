import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Lock, Package, Calendar, CalendarDays, Check, X, LogOut } from "lucide-react";

// Mock order data
const mockOrders = {
  daily: [
    { id: 1, name: "Rahul Kumar", phone: "9876543210", address: "123 Main St", plan: "Daily Meal", amount: 149, status: "pending" },
    { id: 2, name: "Priya Sharma", phone: "9876543211", address: "456 Park Ave", plan: "Daily Meal", amount: 179, status: "delivered" },
    { id: 3, name: "Amit Singh", phone: "9876543212", address: "789 Lake View", plan: "Daily Meal", amount: 149, status: "pending" },
  ],
  weekly: [
    { id: 4, name: "Neha Patel", phone: "9876543213", address: "101 Green St", plan: "Weekly Plan", amount: 899, status: "pending", daysRemaining: 5 },
    { id: 5, name: "Vikram Rao", phone: "9876543214", address: "202 Blue Ave", plan: "Weekly Plan", amount: 899, status: "pending", daysRemaining: 3 },
  ],
  monthly: [
    { id: 6, name: "Anita Gupta", phone: "9876543215", address: "303 Red Lane", plan: "Monthly Plan", amount: 3839, status: "pending", daysRemaining: 22 },
    { id: 7, name: "Suresh Kumar", phone: "9876543216", address: "404 Yellow Blvd", plan: "Monthly Plan", amount: 3839, status: "pending", daysRemaining: 18 },
  ],
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState(mockOrders);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "saif@100") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome, Admin!",
        description: "You are now logged in.",
      });
    } else {
      toast({
        title: "Invalid Password",
        description: "Please enter the correct password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  const markAsDelivered = (type: "daily" | "weekly" | "monthly", orderId: number) => {
    setOrders((prev) => ({
      ...prev,
      [type]: prev[type].map((order) =>
        order.id === orderId ? { ...order, status: "delivered" } : order
      ),
    }));
    toast({
      title: "Order Updated",
      description: "Order has been marked as delivered.",
    });
  };

  const markAsPending = (type: "daily" | "weekly" | "monthly", orderId: number) => {
    setOrders((prev) => ({
      ...prev,
      [type]: prev[type].map((order) =>
        order.id === orderId ? { ...order, status: "pending" } : order
      ),
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-warm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your password to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const OrderCard = ({
    order,
    type,
  }: {
    order: (typeof mockOrders.daily)[0] & { daysRemaining?: number };
    type: "daily" | "weekly" | "monthly";
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{order.name}</h4>
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
            <p className="text-xs text-muted-foreground">{order.plan}</p>
            <p className="font-semibold text-primary">₹{order.amount}</p>
            {order.daysRemaining && (
              <p className="text-xs text-secondary">{order.daysRemaining} days remaining</p>
            )}
          </div>
          <div className="flex gap-2">
            {order.status === "pending" ? (
              <Button
                size="sm"
                variant="leaf"
                onClick={() => markAsDelivered(type, order.id)}
              >
                <Check className="w-4 h-4" />
                Delivered
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAsPending(type, order.id)}
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

  const pendingDaily = orders.daily.filter((o) => o.status === "pending").length;
  const pendingWeekly = orders.weekly.filter((o) => o.status === "pending").length;
  const pendingMonthly = orders.monthly.filter((o) => o.status === "pending").length;

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

        {/* Orders Tabs */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="daily" className="data-[state=active]:bg-card">
              Daily Orders ({orders.daily.length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-card">
              Weekly Orders ({orders.weekly.length})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-card">
              Monthly Orders ({orders.monthly.length})
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
              {orders.daily.map((order) => (
                <OrderCard key={order.id} order={order} type="daily" />
              ))}
            </div>
            {orders.daily.length === 0 && (
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
              {orders.weekly.map((order) => (
                <OrderCard key={order.id} order={order} type="weekly" />
              ))}
            </div>
            {orders.weekly.length === 0 && (
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
              {orders.monthly.map((order) => (
                <OrderCard key={order.id} order={order} type="monthly" />
              ))}
            </div>
            {orders.monthly.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No monthly orders yet.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
