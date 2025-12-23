import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.tsx";
import { supabase } from "@/integrations/supabase/client";
import { createLocalRazorpayOrder, verifyLocalRazorpayPayment, shouldUseLocalIntegration } from "@/lib/razorpay-local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Check, Phone, CreditCard, Wallet, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const mealPlans = [
  { id: "daily", name: "Daily Meal", price: 149, postpaidPrice: 179, days: 1, planType: "daily" as const },
  { id: "weekly", name: "Weekly Plan", price: 899, postpaidPrice: 1079, days: 7, planType: "weekly" as const },
  { id: "monthly", name: "Monthly Plan", price: 3839, postpaidPrice: 4599, days: 30, planType: "monthly" as const },
];

const Order = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan") || "daily";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [paymentType, setPaymentType] = useState<"prepaid" | "postpaid">("prepaid");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const currentPlan = mealPlans.find((p) => p.id === selectedPlan) || mealPlans[0];
  const totalPrice = paymentType === "prepaid" ? currentPlan.price : currentPlan.postpaidPrice;
  const advancePayment = paymentType === "postpaid" ? Math.round(totalPrice * 0.5) : totalPrice;
  const payableAmount = paymentType === "postpaid" ? advancePayment : totalPrice;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    const cleanup = () => {
      document.body.removeChild(script);
    };

    return cleanup;
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        plan_type: currentPlan.planType,
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
          plan_type: currentPlan.planType,
          payment_type: paymentType,
          total_amount: totalPrice,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("Order creation error:", orderError);
        throw new Error(orderError?.message || "Failed to create order");
      }

      // Create Razorpay order with real keys
      const useLocal = shouldUseLocalIntegration();
      let razorpayData;

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
                plan: currentPlan.name,
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
        name: "Daily Dish Delights",
        description: `${currentPlan.name} - ${paymentType === "postpaid" ? "Advance Payment" : "Full Payment"}`,
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

  if (loading) {
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
              <strong>{currentPlan.name}</strong>.
            </p>
            <Card className="bg-card border-border mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium text-foreground">{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type:</span>
                    <span className="font-medium text-foreground capitalize">{paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-bold text-primary">₹{payableAmount}</span>
                  </div>
                  {paymentType === "postpaid" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due:</span>
                      <span className="font-medium text-foreground">₹{totalPrice - advancePayment}</span>
                    </div>
                  )}
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
                        htmlFor={plan.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value={plan.id} id={plan.id} />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.days} {plan.days === 1 ? "day" : "days"}</p>
                        </div>
                        <p className="font-bold text-primary">₹{plan.price}</p>
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
                    value={paymentType}
                    onValueChange={(value) => setPaymentType(value as "prepaid" | "postpaid")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="prepaid"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentType === "prepaid"
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
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentType === "postpaid"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <RadioGroupItem value="postpaid" id="postpaid" />
                      <Wallet className="w-5 h-5 text-secondary" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Postpaid</p>
                        <p className="text-sm text-muted-foreground">50% now, rest on delivery</p>
                      </div>
                    </Label>
                  </RadioGroup>
                  {paymentType === "postpaid" && (
                    <p className="text-sm text-muted-foreground mt-4 bg-muted p-3 rounded-lg">
                      Note: Postpaid orders are priced at ₹179/meal instead of ₹149/meal.
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
                      <span className="text-foreground font-medium">{currentPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Duration:</span>
                      <span className="text-foreground font-medium">
                        {currentPlan.days} {currentPlan.days === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Payment:</span>
                      <span className="text-foreground font-medium capitalize">{paymentType}</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-foreground font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                      </div>
                      {paymentType === "postpaid" && (
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
                      disabled={isSubmitting || !razorpayLoaded}
                    >
                      {isSubmitting ? (
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