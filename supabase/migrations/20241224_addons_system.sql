-- Create add_ons table for managing available add-ons
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_addons table for tracking add-ons per order
CREATE TABLE IF NOT EXISTS order_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
    selected_dates DATE[] DEFAULT '{}', -- For weekly/monthly plans, which specific dates
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, addon_id)
);

-- Insert default chicken fry add-on
INSERT INTO add_ons (name, price, description) VALUES
('Chicken Fry', 50.00, 'Crispy fried chicken pieces - perfect addition to your meal')
ON CONFLICT DO NOTHING;

-- Create RLS policies
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addons ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read add-ons
CREATE POLICY "Everyone can view active add-ons" ON add_ons
    FOR SELECT TO authenticated, anon USING (is_active = true);

-- Allow everyone to read order add-ons (for order status)
CREATE POLICY "Users can view order add-ons" ON order_addons
    FOR SELECT TO authenticated, anon USING (true);

-- Allow authenticated users to create order add-ons
CREATE POLICY "Authenticated users can create order add-ons" ON order_addons
    FOR INSERT TO authenticated WITH CHECK (true);

-- Admin policies for managing add-ons
CREATE POLICY "Authenticated users can modify add-ons" ON add_ons
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can modify order add-ons" ON order_addons
    FOR ALL TO authenticated USING (true);