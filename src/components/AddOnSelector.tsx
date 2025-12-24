import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";

interface AddOn {
    id: string;
    name: string;
    price: number;
    description: string | null;
    is_active: boolean;
}

interface AddOnSelection {
    addonId: string;
    selectedDates: Date[];
    quantity: number;
}

interface AddOnSelectorProps {
    planType: 'daily' | 'weekly' | 'monthly';
    planDays: number;
    startDate?: Date;
    onSelectionChange: (selections: AddOnSelection[], totalPrice: number) => void;
    initialSelections?: AddOnSelection[];
    disabled?: boolean;
}

const AddOnSelector = ({
    planType,
    planDays,
    startDate = new Date(),
    onSelectionChange,
    initialSelections = [],
    disabled = false
}: AddOnSelectorProps) => {
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [selections, setSelections] = useState<AddOnSelection[]>(initialSelections);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddOns();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [selections, addOns]);

    const fetchAddOns = async () => {
        const { data, error } = await supabase
            .from('add_ons')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching add-ons:', error);
            return;
        }

        setAddOns(data || []);
        setLoading(false);
    };

    const calculateTotal = () => {
        let totalPrice = 0;
        selections.forEach(selection => {
            const addon = addOns.find(a => a.id === selection.addonId);
            if (addon) {
                if (planType === 'daily') {
                    totalPrice += addon.price * selection.quantity;
                } else {
                    totalPrice += addon.price * selection.selectedDates.length * selection.quantity;
                }
            }
        });
        onSelectionChange(selections, totalPrice);
    };

    const toggleAddOn = (addonId: string) => {
        const existingIndex = selections.findIndex(s => s.addonId === addonId);

        if (existingIndex >= 0) {
            // Remove selection
            const newSelections = selections.filter(s => s.addonId !== addonId);
            setSelections(newSelections);
        } else {
            // Add selection
            const newSelection: AddOnSelection = {
                addonId,
                selectedDates: planType === 'daily' ? [startDate] : [],
                quantity: 1
            };
            setSelections([...selections, newSelection]);
        }
    };

    const updateSelectedDates = (addonId: string, dates: Date[]) => {
        setSelections(prev => prev.map(selection =>
            selection.addonId === addonId
                ? { ...selection, selectedDates: dates }
                : selection
        ));
    };

    const updateQuantity = (addonId: string, change: number) => {
        setSelections(prev => prev.map(selection =>
            selection.addonId === addonId
                ? { ...selection, quantity: Math.max(1, selection.quantity + change) }
                : selection
        ));
    };

    const getAvailableDates = () => {
        const dates: Date[] = [];
        for (let i = 0; i < planDays; i++) {
            dates.push(addDays(startDate, i));
        }
        return dates;
    };

    const isDateSelected = (addonId: string, date: Date) => {
        const selection = selections.find(s => s.addonId === addonId);
        return selection?.selectedDates.some(d =>
            startOfDay(d).getTime() === startOfDay(date).getTime()
        ) || false;
    };

    const toggleDate = (addonId: string, date: Date) => {
        const selection = selections.find(s => s.addonId === addonId);
        if (!selection) return;

        const dateTime = startOfDay(date).getTime();
        const isSelected = selection.selectedDates.some(d =>
            startOfDay(d).getTime() === dateTime
        );

        let newDates: Date[];
        if (isSelected) {
            newDates = selection.selectedDates.filter(d =>
                startOfDay(d).getTime() !== dateTime
            );
        } else {
            newDates = [...selection.selectedDates, date];
        }

        updateSelectedDates(addonId, newDates);
    };

    if (loading) {
        return <div className="text-center py-4">Loading add-ons...</div>;
    }

    if (addOns.length === 0) {
        return null;
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Add-Ons (Optional)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {addOns.map((addon) => {
                    const selection = selections.find(s => s.addonId === addon.id);
                    const isSelected = !!selection;
                    const availableDates = getAvailableDates();

                    return (
                        <div key={addon.id} className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleAddOn(addon.id)}
                                        disabled={disabled}
                                    />
                                    <div>
                                        <h4 className="font-medium">{addon.name}</h4>
                                        {addon.description && (
                                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="secondary">₹{addon.price}</Badge>
                            </div>

                            {isSelected && (
                                <div className="ml-6 space-y-3 p-3 bg-muted/30 rounded-lg">
                                    {/* Pack Selector */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">Packs:</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateQuantity(addon.id, -1)}
                                                disabled={disabled || (selection?.quantity || 1) <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center">{selection?.quantity || 1}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateQuantity(addon.id, 1)}
                                                disabled={disabled}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Date Selection for Multi-day Plans */}
                                    {planType !== 'daily' && (
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium">Select Days:</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {availableDates.map((date, index) => (
                                                    <Button
                                                        key={index}
                                                        size="sm"
                                                        variant={isDateSelected(addon.id, date) ? "default" : "outline"}
                                                        onClick={() => toggleDate(addon.id, date)}
                                                        disabled={disabled}
                                                        className="text-xs"
                                                    >
                                                        Day {index + 1}
                                                        <br />
                                                        {format(date, 'MMM dd')}
                                                    </Button>
                                                ))}
                                            </div>
                                            {selection && selection.selectedDates.length > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    Selected {selection.selectedDates.length} day(s) × ₹{addon.price} × {selection.quantity} packs = ₹{addon.price * selection.selectedDates.length * selection.quantity}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Daily Plan Price Display */}
                                    {planType === 'daily' && selection && (
                                        <p className="text-xs text-muted-foreground">
                                            ₹{addon.price} × {selection.quantity} packs = ₹{addon.price * selection.quantity}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default AddOnSelector;