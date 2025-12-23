import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.tsx";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'];

const OrderStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Your Orders</h1>
            <p className="text-muted-foreground">Here is a list of your past and current orders.</p>
          </div>

          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <Card key={order.id} className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-display text-xl">Order #{order.id.substring(0, 8)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between"><span className="text-muted-foreground">Plan:</span><span className="font-medium text-foreground">{order.plan_type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="font-medium text-primary capitalize">{order.status}</span></div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-bold"><span className="text-foreground">Total:</span><span className="text-primary">₹{order.total_amount}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-card border-border mt-6">
            <CardHeader><CardTitle className="font-display text-xl">Delivery Information</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-foreground"><strong>Estimated Delivery Time:</strong></p>
                <p className="text-2xl font-bold text-primary">8:00 PM - 9:00 PM</p>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-1">For any questions, call us:</p>
                <a href="tel:9550043174" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"><Phone className="w-4 h-4" /> 9550043174</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatus;
