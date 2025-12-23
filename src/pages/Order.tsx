import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Check, Phone, CreditCard, Wallet } from "lucide-react";

const mealPlans = [
  { id: "daily-meal", name: "Daily Meal", price: 149, postpaidPrice: 179, days: 1 },
  { id: "weekly-plan", name: "Weekly Plan", price: 899, postpaidPrice: 1079, days: 7 },
  { id: "15-day-plan", name: "15-Day Plan", price: 1919, postpaidPrice: 2299, days: 15 },
  { id: "monthly-plan", name: "Monthly Plan", price: 3839, postpaidPrice: 4599, days: 30 },
];

const Order = () => {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get("plan") || "daily-meal";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [paymentType, setPaymentType] = useState("prepaid");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const currentPlan = mealPlans.find((p) => p.id === selectedPlan) || mealPlans[0];
  const totalPrice = paymentType === "prepaid" ? currentPlan.price : currentPlan.postpaidPrice;
  const advancePayment = paymentType === "postpaid" ? Math.round(totalPrice * 0.5) : totalPrice;

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

    setIsSubmitting(true);

    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setOrderPlaced(true);

    toast({
      title: "Order Placed Successfully! 🎉",
      description: "We'll contact you shortly to confirm your order.",
    });
  };

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
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order, {formData.name}! We've received your order for the{" "}
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
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-primary">₹{totalPrice}</span>
                  </div>
                  {paymentType === "postpaid" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advance (50%):</span>
                      <span className="font-medium text-foreground">₹{advancePayment}</span>
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
            <Button variant="hero" size="lg" onClick={() => setOrderPlaced(false)}>
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
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPlan === plan.id
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
                    onValueChange={setPaymentType}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="prepaid"
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentType === "prepaid"
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
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentType === "postpaid"
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
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-muted-foreground">Advance Payment (50%):</span>
                          <span className="text-secondary font-semibold">₹{advancePayment}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Placing Order..." : "Place Order"}
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
