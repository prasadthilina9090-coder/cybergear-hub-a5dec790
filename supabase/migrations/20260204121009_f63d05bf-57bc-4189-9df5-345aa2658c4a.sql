-- Create storage bucket for payment slips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', false);

-- Allow authenticated users to upload payment slips
CREATE POLICY "Users can upload their own payment slips"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-slips' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own payment slips
CREATE POLICY "Users can view their own payment slips"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-slips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all payment slips
CREATE POLICY "Admins can view all payment slips"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-slips' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add payment_method and payment_slip_url columns to orders
ALTER TABLE public.orders 
ADD COLUMN payment_method text DEFAULT 'cash_on_delivery',
ADD COLUMN payment_slip_url text;