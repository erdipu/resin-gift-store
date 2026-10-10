-- ==============================================================================
-- LUXECRAFT STUDIO - SUPABASE DATABASE SCHEMA
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor -> Run!
-- ==============================================================================

-- 1. Create Profiles Table (Stores user name, phone, and role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to insert/update their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Create Orders Table (Stores customer orders & tracking)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  status_step INT DEFAULT 1,
  status_label TEXT DEFAULT 'Design Queue (Preview Pending)',
  shipping_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow store seller and customers to view orders
CREATE POLICY "Allow view orders" 
ON public.orders FOR SELECT 
USING (true);

-- Allow status updates by seller
CREATE POLICY "Allow update orders" 
ON public.orders FOR UPDATE 
USING (true);

-- Allow users or public checkout to place orders
CREATE POLICY "Anyone can create an order" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 3. Automatic Profile Creation on Signup (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    new.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. Create Samples Table (Artisan Creations & Catalog across all devices)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.samples (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_ready_to_ship BOOLEAN DEFAULT true,
  is_customizable BOOLEAN DEFAULT false,
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Samples
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Allow anyone across any device worldwide to view all sample creations
CREATE POLICY "Allow public read samples" 
ON public.samples FOR SELECT 
USING (true);

-- Allow inserting samples
CREATE POLICY "Allow public insert samples" 
ON public.samples FOR INSERT 
WITH CHECK (true);

-- Allow updating samples
CREATE POLICY "Allow public update samples" 
ON public.samples FOR UPDATE 
USING (true);

-- Allow deleting samples
CREATE POLICY "Allow public delete samples" 
ON public.samples FOR DELETE 
USING (true);

