// Razorpay integration utilities
export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        contact: string;
        email?: string;
    };
    theme: {
        color: string;
    };
    modal: {
        ondismiss: () => void;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    payment_id?: string;
}

// Razorpay test card numbers for development
export const RAZORPAY_TEST_CARDS = {
    SUCCESS: {
        number: "4111111111111111",
        cvv: "123",
        expiry: "12/25",
        name: "Test Card"
    },
    FAILURE: {
        number: "4000000000000002",
        cvv: "123",
        expiry: "12/25",
        name: "Test Failure Card"
    }
};

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

// Format amount for display
export const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Calculate discount percentage
export const calculateDiscount = (original: number, discounted: number): number => {
    return Math.round(((original - discounted) / original) * 100);
};

// Validate phone number
export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Validate email
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

declare global {
    interface Window {
        Razorpay: any;
    }
}