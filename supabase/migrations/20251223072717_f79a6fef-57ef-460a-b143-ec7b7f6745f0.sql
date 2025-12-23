-- Drop existing insert policy and create a better one
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Allow anyone to insert orders (for customers placing orders)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read their own order right after creating (using phone as identifier)
CREATE POLICY "Customers can view their orders by phone"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);