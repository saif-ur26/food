import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const TestDB = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const testConnection = async () => {
        setIsLoading(true);
        try {
            // Test basic connection
            const { data, error } = await supabase
                .from("daily_meals")
                .select("*")
                .limit(1);

            if (error) {
                throw error;
            }

            setResults({ success: true, data, message: "Database connection successful!" });
            toast({
                title: "Success",
                description: "Database connection is working!",
            });
        } catch (error: any) {
            console.error("Database test error:", error);
            setResults({ success: false, error: error.message, message: "Database connection failed!" });
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const testOrderCreation = async () => {
        setIsLoading(true);
        try {
            // Test order creation with minimal data
            const testOrder = {
                customer_name: "Test Customer",
                phone: "1234567890",
                address: "Test Address",
                plan_type: "daily" as const,
                payment_type: "prepaid" as const,
                total_amount: 149,
            };

            console.log("Testing order creation with:", testOrder);

            const { data, error } = await supabase
                .from("orders")
                .insert(testOrder)
                .select()
                .single();

            if (error) {
                throw error;
            }

            setResults({ success: true, data, message: "Order creation successful!" });
            toast({
                title: "Success",
                description: "Order creation is working!",
            });

            // Clean up - delete the test order
            await supabase.from("orders").delete().eq("id", data.id);
        } catch (error: any) {
            console.error("Order creation test error:", error);
            setResults({ success: false, error: error.message, message: "Order creation failed!" });
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Database Test Page</h1>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Connection Test</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={testConnection} disabled={isLoading}>
                                {isLoading ? "Testing..." : "Test Database Connection"}
                            </Button>

                            <Button onClick={testOrderCreation} disabled={isLoading}>
                                {isLoading ? "Testing..." : "Test Order Creation"}
                            </Button>

                            {results && (
                                <div className={`p-4 rounded-lg ${results.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                    <h3 className={`font-semibold ${results.success ? "text-green-800" : "text-red-800"}`}>
                                        {results.message}
                                    </h3>
                                    {results.error && (
                                        <p className="text-red-600 mt-2">Error: {results.error}</p>
                                    )}
                                    {results.data && (
                                        <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                                            {JSON.stringify(results.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Environment Check</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
                                <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TestDB;