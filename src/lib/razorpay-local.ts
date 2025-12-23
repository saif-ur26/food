// Local Razorpay integration for development
import { supabase } from '@/integrations/supabase/client';

export interface RazorpayOrderData {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

// Create a Razorpay order for checkout (without API call)
export const createLocalRazorpayOrder = async (
    amount: number,
    orderId: string,
    customerName: string
): Promise<RazorpayOrderData> => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
        throw new Error("Razorpay Key ID not configured");
    }

    console.log("Creating Razorpay order for checkout:", {
        amount,
        orderId,
        customerName,
        keyId: keyId.substring(0, 12) + "..."
    });

    // For development, we'll use the checkout without pre-creating orders
    // Razorpay checkout can work without order_id for simple payments
    return {
        orderId: `receipt_${orderId}`, // Use receipt format
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        keyId: keyId,
    };
};

// Verify payment locally (simulated for development)
export const verifyLocalRazorpayPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    orderId: string
): Promise<{ success: boolean; message: string }> => {
    console.log("Verifying local Razorpay payment:", {
        razorpayOrderId,
        razorpayPaymentId,
        orderId
    });

    try {
        // Update order status in database
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "pending",
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Error updating order:", updateError);
            throw new Error("Failed to update order status");
        }

        console.log("Order updated successfully:", orderId);

        return {
            success: true,
            message: "Payment verified successfully"
        };
    } catch (error: any) {
        console.error("Payment verification error:", error);
        return {
            success: false,
            message: error.message || "Payment verification failed"
        };
    }
};

// Check if we should use local integration
export const shouldUseLocalIntegration = (): boolean => {
    // Use local integration in development or when edge functions are not available
    return import.meta.env.DEV || !import.meta.env.VITE_USE_EDGE_FUNCTIONS;
};