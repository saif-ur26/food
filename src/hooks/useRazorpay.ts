import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
    loadRazorpayScript,
    RazorpayOptions,
    CreateOrderResponse,
    VerifyPaymentResponse
} from '@/lib/razorpay';

interface UseRazorpayProps {
    onSuccess?: (paymentId: string) => void;
    onError?: (error: string) => void;
}

export const useRazorpay = ({ onSuccess, onError }: UseRazorpayProps = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        const initRazorpay = async () => {
            const loaded = await loadRazorpayScript();
            setIsScriptLoaded(loaded);

            if (!loaded) {
                toast({
                    title: "Payment Gateway Error",
                    description: "Failed to load payment gateway. Please refresh and try again.",
                    variant: "destructive",
                });
            }
        };

        initRazorpay();
    }, []);

    const createOrder = async (amount: number, orderId: string, customerName: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    amount,
                    receipt: `order_${orderId}`,
                    notes: {
                        order_id: orderId,
                        customer_name: customerName,
                    },
                },
            });

            if (error) throw error;
            return data as CreateOrderResponse;
        } catch (error: any) {
            console.error('Error creating Razorpay order:', error);
            throw new Error('Failed to create payment order');
        }
    };

    const verifyPayment = async (
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
        orderId: string
    ) => {
        try {
            const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
                body: {
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: razorpayPaymentId,
                    razorpay_signature: razorpaySignature,
                    order_id: orderId,
                },
            });

            if (error) throw error;
            return data as VerifyPaymentResponse;
        } catch (error: any) {
            console.error('Error verifying payment:', error);
            throw new Error('Payment verification failed');
        }
    };

    const processPayment = async (
        amount: number,
        orderId: string,
        customerDetails: {
            name: string;
            phone: string;
            email?: string;
        },
        planName: string
    ) => {
        if (!isScriptLoaded) {
            toast({
                title: "Payment Gateway Loading",
                description: "Please wait while payment gateway loads.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create Razorpay order
            const orderData = await createOrder(amount, orderId, customerDetails.name);

            // Configure Razorpay options
            const options: RazorpayOptions = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Express Home Meals",
                description: `${planName} - Fresh homemade meals`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyData = await verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            orderId
                        );

                        if (verifyData.success) {
                            toast({
                                title: "Payment Successful!",
                                description: "Your order has been placed successfully.",
                            });
                            onSuccess?.(response.razorpay_payment_id);
                        } else {
                            throw new Error("Payment verification failed");
                        }
                    } catch (error: any) {
                        toast({
                            title: "Payment Verification Failed",
                            description: "Please contact support with your payment details.",
                            variant: "destructive",
                        });
                        onError?.(error.message);
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: customerDetails.name,
                    contact: customerDetails.phone,
                    email: customerDetails.email,
                },
                theme: {
                    color: "#C2622D",
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        toast({
                            title: "Payment Cancelled",
                            description: "You can try again when ready.",
                        });
                    },
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Payment processing error:', error);
            toast({
                title: "Payment Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
            onError?.(error.message);
            setIsLoading(false);
        }
    };

    return {
        processPayment,
        isLoading,
        isScriptLoaded,
    };
};