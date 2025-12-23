import { Check, X, Loader2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentStatusProps {
    status: "loading" | "success" | "error" | "idle";
    message?: string;
    onRetry?: () => void;
    onClose?: () => void;
}

const PaymentStatus = ({ status, message, onRetry, onClose }: PaymentStatusProps) => {
    const getStatusIcon = () => {
        switch (status) {
            case "loading":
                return <Loader2 className="w-12 h-12 animate-spin text-primary" />;
            case "success":
                return <Check className="w-12 h-12 text-green-500" />;
            case "error":
                return <X className="w-12 h-12 text-red-500" />;
            default:
                return <CreditCard className="w-12 h-12 text-muted-foreground" />;
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case "loading":
                return "Processing Payment...";
            case "success":
                return "Payment Successful!";
            case "error":
                return "Payment Failed";
            default:
                return "Ready to Pay";
        }
    };

    const getStatusMessage = () => {
        if (message) return message;

        switch (status) {
            case "loading":
                return "Please wait while we process your payment. Do not close this window.";
            case "success":
                return "Your payment has been processed successfully. You will receive a confirmation shortly.";
            case "error":
                return "There was an issue processing your payment. Please try again.";
            default:
                return "Click the button below to proceed with payment.";
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "success":
                return "border-green-200 bg-green-50";
            case "error":
                return "border-red-200 bg-red-50";
            case "loading":
                return "border-blue-200 bg-blue-50";
            default:
                return "border-border bg-card";
        }
    };

    return (
        <Card className={`${getStatusColor()} transition-all duration-300`}>
            <CardContent className="pt-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        {getStatusIcon()}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {getStatusTitle()}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {getStatusMessage()}
                        </p>
                    </div>

                    {status === "error" && onRetry && (
                        <div className="flex gap-2 justify-center">
                            <Button onClick={onRetry} variant="default" size="sm">
                                Try Again
                            </Button>
                            {onClose && (
                                <Button onClick={onClose} variant="outline" size="sm">
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}

                    {status === "success" && onClose && (
                        <Button onClick={onClose} variant="default" size="sm">
                            Continue
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentStatus;