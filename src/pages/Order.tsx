import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.tsx";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { createLocalRazorpayOrder, verifyLocalRazorpayPayment, shouldUseLocalIntegration } from "@/lib/razorpay-local";
import { getTodayMenu } from "@/lib/pricing";
import { isOrderingAllowed, getTimeUntilCutoff } from "@/lib/timeUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddOnSelector from "@/components/AddOnSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Check, Phone, CreditCard, Wallet, Loader2, UtensilsCrossed, Clock, AlertCircle, Calendar } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  days: number;
  original_price: number;
  current_price: number;
  plan_type: string;
}

interface AddOnSelection {
  addonId: string;
  selectedDates: Date[];
  quantity: number;
}

const Order = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan") || "daily";

  const [mealPlans, setMealPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [paymentType, setPaymentType] = useState<"prepaid" | "postpaid">("prepaid");
  const [addOnSelections, setAddOnSelections] = useState<AddOnSelection[]>([]);
  const [addOnTotalPrice, setAddOnTotalPrice] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [todayMenu, setTodayMenu] = useState<string[]>([]);
  const [canOrder, setCanOrder] = useState(true);
  const [timeMessage, setTimeMessage] = useState("");
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch pricing plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Use a direct query since pricing_plans table exists
        const { data, error } = await supabase
          .from('pricing_plans')
          .select('id, name, days, original_price, current_price, plan_type')
          .eq('is_active', true)
          .order('days', { ascending: true });

        if (error) {
          console.error('Error fetching pricing plans:', error);
          return;
        }

        setMealPlans(data || []);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const currentPlan = mealPlans.find((p) => p.plan_type === selectedPlan) || mealPlans[0];

  // Weekly and monthly plans are only prepaid
  const isMultiDayPlan = currentPlan?.plan_type === 'weekly' || currentPlan?.plan_type === 'monthly';
  const effectivePaymentType = isMultiDayPlan ? 'prepaid' : paymentType;

  const totalPrice = effectivePaymentType === "prepaid" ? (currentPlan?.current_price || 0) + addOnTotalPrice : Math.round(((currentPlan?.current_price || 0) + addOnTotalPrice) * 1.2); // 20% markup for postpaid
  const advancePayment = effectivePaymentType === "postpaid" ? Math.round(totalPrice * 0.5) : totalPrice;
  const payableAmount = effectivePaymentType === "postpaid" ? advancePayment : totalPrice;

  // Calculate plan dates
  const getStartDate = () => {
    const today = new Date();
    if (isMultiDayPlan) {
      // Multi-day plans start from next day
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return today; // Daily plans start today
  };

  const getEndDate = () => {
    const startDate = getStartDate();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (currentPlan?.days || 1) - 1);
    return endDate;
  };

  // Load Razorpay script and today's menu
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    // Load today's menu and check ordering time
    const loadTodayMenu = async () => {
      const menu = await getTodayMenu();
      setTodayMenu(menu);
    };
    loadTodayMenu();

    // Set up real-time subscription for menu updates
    const menuSubscription = supabase
      .channel('daily_meals_order_page')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_meals'
        },
        (payload) => {
          console.log('Menu updated on order page:', payload);
          loadTodayMenu(); // Refetch menu when changes occur
        }
      )
      .subscribe();

    // Check ordering time restrictions
    const checkOrderingTime = () => {
      // Multi-day plans (weekly/monthly) don't have time restrictions
      if (isMultiDayPlan) {
        setCanOrder(true);
        setTimeMessage("Multi-day plans can be ordered anytime and start from tomorrow");
        return;
      }

      // Daily plans have 5 PM cutoff
      const allowed = isOrderingAllowed();
      setCanOrder(allowed);

      if (allowed) {
        setTimeMessage(getTimeUntilCutoff());
      } else {
        setTimeMessage(`Ordering closed for today. Order next day before 5:00 PM`);
      }
    };

    checkOrderingTime();

    // Update time message every minute
    const timeInterval = setInterval(checkOrderingTime, 60000);

    const cleanup = () => {
      document.body.removeChild(script);
      clearInterval(timeInterval);
      menuSubscription.unsubscribe();
    };

    return cleanup;
  }, [isMultiDayPlan]);

  // Update payment type when plan changes
  useEffect(() => {
    if (isMultiDayPlan) {
      setPaymentType('prepaid');
    }
  }, [selectedPlan, isMultiDayPlan]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      toast({ title: "Login Required", description: "Please login to place an order.", variant: "destructive" });
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata.full_name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddOnSelectionChange = (selections: AddOnSelection[], totalPrice: number) => {
    setAddOnSelections(selections);
    setAddOnTotalPrice(totalPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if ordering is allowed (only for daily plans)
    if (!isMultiDayPlan && !canOrder) {
      toast({
        title: "Ordering Closed",
        description: "Daily orders can only be placed before 5:00 PM. Please try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Payment Loading",
        description: "Please wait while payment gateway loads.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creating order with data:", {
        user_id: user?.id,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        plan_type: currentPlan?.plan_type,
        payment_type: paymentType,
        total_amount: totalPrice,
      });

      // First create the order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id,
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          plan_type: (currentPlan?.plan_type || 'daily') as Database["public"]["Enums"]["plan_type"],
          payment_type: effectivePaymentType,
          total_amount: totalPrice,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError?.message || "Failed to create order");
      }

      // Create add-ons if any are selected
      if (addOnSelections.length > 0) {
        for (const selection of addOnSelections) {
          const { error: addonError } = await supabase
            .from("order_addons")
            .insert({
              order_id: orderData.id,
              addon_id: selection.addonId,
              selected_dates: selection.selectedDates.map(date => date.toISOString().split('T')[0]),
              quantity: selection.quantity,
              total_price: addOnTotalPrice / addOnSelections.length, // Distribute total price
            });

          if (addonError) {
            console.error("Add-on creation error:", addonError);
            // Don't fail the entire order for add-on errors, just log them
          }
        }
      }

      // Create Razorpay order with real keys
      const useLocal = shouldUseLocalIntegration();
      let razorpayData: any;

      if (useLocal) {
        // Use local Razorpay integration with real keys
        console.log("Using local Razorpay integration with real keys");
        razorpayData = await createLocalRazorpayOrder(payableAmount, orderData.id, formData.name);
      } else {
        // Use Supabase edge functions (for production)
        const { data, error: razorpayError } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              amount: payableAmount,
              receipt: `order_${orderData.id}`,
              notes: {
                order_id: orderData.id,
                plan: currentPlan?.name || 'Meal Plan',
                customer_name: formData.name,
              },
            },
          }
        );

        if (razorpayError || !data) {
          throw new Error("Failed to create payment order");
        }

        razorpayData = data;
      }

      // Open Razorpay checkout
      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "Mamma's Food",
        description: `${currentPlan?.name || 'Meal Plan'} - ${effectivePaymentType === "postpaid" ? "Advance Payment" : "Full Payment"}`,
        // Note: order_id is optional for simple payments
        handler: async (response: any) => {
          try {
            if (useLocal) {
              // Use local payment verification with real Razorpay response
              console.log("Using local payment verification");
              const verifyResult = await verifyLocalRazorpayPayment(
                response.razorpay_order_id || "direct_payment",
                response.razorpay_payment_id,
                response.razorpay_signature || "direct_signature",
                orderData.id
              );

              if (!verifyResult.success) {
                throw new Error(verifyResult.message);
              }
            } else {
              // Use Supabase edge functions for verification
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: orderData.id,
                  },
                }
              );

              if (verifyError || !verifyData?.success) {
                throw new Error("Payment verification failed");
              }
            }

            setOrderPlaced(true);
            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully.",
            });
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support with your payment details.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: "#C2622D",
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready.",
            });
          },
        },
      };

      // Always use real Razorpay now (with your test keys)
      if (!razorpayLoaded) {
        toast({
          title: "Payment Gateway Loading",
          description: "Please wait while payment gateway loads.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Order error:", error.message || error);
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (loading || plansLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order, {formData.name}! We've received your payment for the{" "}
              <strong>{currentPlan?.name || 'Meal Plan'}</strong>.
            </p>
            <Card className="bg-card border-border mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium text-foreground">{currentPlan?.name || 'Meal Plan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type:</span>
                    <span className="font-medium text-foreground capitalize">{effectivePaymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-bold text-primary">₹{payableAmount}</span>
                  </div>
                  {effectivePaymentType === "postpaid" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due:</span>
                      <span className="font-medium text-foreground">₹{totalPrice - advancePayment}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Delivery Time:</span>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">8:00 PM - 9:00 PM</span>
                        <p className="text-xs text-muted-foreground">Daily delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Delivery Information</h3>
                </div>
                <div className="text-left space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-blue-700">Your dinner will be delivered between <strong>8:00 PM - 9:00 PM</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-blue-700">Fresh, hot meal delivered to: <strong>{formData.address}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="text-blue-700">No delivery charges • Free home delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="bg-muted rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                For any queries, contact us at:
              </p>
              <a
                href="tel:9550043174"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" />
                9550043174
              </a>
            </div>
            <Button variant="hero" size="lg" onClick={() => {
              setOrderPlaced(false);
              setFormData({ name: "", phone: "", address: "" });
              setIsSubmitting(false);
            }}>
              Place Another Order
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Razorpay Test Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <strong>Test Mode:</strong> Using Razorpay test keys. Use test card: 4111 1111 1111 1111
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        {/* Time Restriction Notice - Only show for daily plans */}
        {!isMultiDayPlan && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className={`border-2 ${canOrder ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  {canOrder ? (
                    <Clock className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className={`font-medium ${canOrder ? 'text-green-800' : 'text-red-800'}`}>
                      {canOrder ? 'Ordering Open' : 'Ordering Closed'}
                    </p>
                    <p className={`text-sm ${canOrder ? 'text-green-700' : 'text-red-700'}`}>
                      {timeMessage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delivery Time Information */}
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Daily Delivery Time</p>
                    <p className="text-sm text-blue-700">Fresh dinner delivered hot to your door</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">8:00 PM - 9:00 PM</p>
                  <p className="text-sm text-blue-700">Every day, including weekends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Duration Notice - Show for multi-day plans */}
        {isMultiDayPlan && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Plan Duration: {getStartDate().toLocaleDateString()} - {getEndDate().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-700">
                      Your {currentPlan?.name} will start from tomorrow and run for {currentPlan?.days} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today's Menu Section */}
        {todayMenu.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-primary" />
                  Today's Menu - {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {todayMenu.map((item, index) => (
                    <div
                      key={index}
                      className="bg-background/80 rounded-lg p-3 text-center border border-border/50"
                    >
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Fresh meals prepared daily with these delicious items!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Place Your Order
            </h1>
            <p className="text-muted-foreground">
              Choose your meal plan and complete your order in just a few steps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Meal Plan Selection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Select Meal Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedPlan}
                    onValueChange={setSelectedPlan}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {mealPlans.map((plan) => (
                      <Label
                        key={plan.id}
                        htmlFor={plan.plan_type}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.plan_type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value={plan.plan_type} id={plan.plan_type} />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.days} {plan.days === 1 ? "day" : "days"}</p>
                        </div>
                        <p className="font-bold text-primary">₹{plan.current_price}</p>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Type */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Payment Option</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={effectivePaymentType}
                    onValueChange={(value) => !isMultiDayPlan && setPaymentType(value as "prepaid" | "postpaid")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="prepaid"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${effectivePaymentType === "prepaid"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="prepaid" id="prepaid" />
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Prepaid</p>
                        <p className="text-sm text-muted-foreground">Pay full amount now</p>
                      </div>
                    </Label>
                    <Label
                      htmlFor="postpaid"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isMultiDayPlan
                        ? "cursor-not-allowed opacity-50 border-gray-200 bg-gray-50"
                        : effectivePaymentType === "postpaid"
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border hover:border-primary/50 cursor-pointer"
                        }`}
                    >
                      <RadioGroupItem
                        value="postpaid"
                        id="postpaid"
                        disabled={isMultiDayPlan}
                      />
                      <Wallet className={`w-5 h-5 ${isMultiDayPlan ? 'text-gray-400' : 'text-secondary'}`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${isMultiDayPlan ? 'text-gray-400' : 'text-foreground'}`}>
                          Postpaid
                        </p>
                        <p className={`text-sm ${isMultiDayPlan ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          {isMultiDayPlan ? 'Not available for multi-day plans' : '50% now, rest on delivery'}
                        </p>
                      </div>
                    </Label>
                  </RadioGroup>
                  {effectivePaymentType === "postpaid" && !isMultiDayPlan && (
                    <p className="text-sm text-muted-foreground mt-4 bg-muted p-3 rounded-lg">
                      Note: Postpaid orders have a 20% markup for convenience.
                    </p>
                  )}
                  {isMultiDayPlan && (
                    <p className="text-sm text-blue-600 mt-4 bg-blue-50 p-3 rounded-lg">
                      Multi-day plans require full prepayment for better meal planning and delivery scheduling.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-foreground">
                      Delivery Address *
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete delivery address"
                      className="mt-1"
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add-Ons Selection */}
              {currentPlan && (
                <AddOnSelector
                  planType={currentPlan.plan_type as 'daily' | 'weekly' | 'monthly'}
                  planDays={currentPlan.days}
                  startDate={getStartDate()}
                  onSelectionChange={handleAddOnSelectionChange}
                  disabled={isSubmitting}
                />
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <Card className="bg-card border-border shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-display text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Plan:</span>
                      <span className="text-foreground font-medium">{currentPlan?.name || 'Meal Plan'}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Duration:</span>
                      <span className="text-foreground font-medium">
                        {currentPlan?.days || 1} {(currentPlan?.days || 1) === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Payment:</span>
                      <span className="text-foreground font-medium capitalize">{effectivePaymentType}</span>
                    </div>

                    {/* Add-ons Summary */}
                    {addOnSelections.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <h4 className="font-medium text-foreground">Add-ons:</h4>
                        {addOnSelections.map((selection, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Chicken Fry</span>
                              <span className="text-foreground">₹50 × {selection.quantity} packs</span>
                            </div>
                            {selection.selectedDates.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {selection.selectedDates.length} day(s) selected
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium">
                          <span>Add-ons Total:</span>
                          <span className="text-secondary">₹{addOnTotalPrice}</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-foreground font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                      </div>
                      {effectivePaymentType === "postpaid" && (
                        <>
                          <div className="flex justify-between mt-2 text-sm">
                            <span className="text-muted-foreground">Pay Now (50%):</span>
                            <span className="text-secondary font-semibold">₹{advancePayment}</span>
                          </div>
                          <div className="flex justify-between mt-1 text-sm">
                            <span className="text-muted-foreground">On Delivery:</span>
                            <span className="text-foreground">₹{totalPrice - advancePayment}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || !razorpayLoaded || (!isMultiDayPlan && !canOrder)}
                    >
                      {(!isMultiDayPlan && !canOrder) ? (
                        "Ordering Closed"
                      ) : isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${payableAmount}`
                      )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>For queries, call:</p>
                      <a href="tel:9550043174" className="text-primary font-semibold hover:underline">
                        9550043174
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Order;