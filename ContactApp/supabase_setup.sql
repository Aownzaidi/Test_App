-- Supabase Contact Form Table
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Project: peyqrqpkvybwchenbewf

-- Create the contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 20),
  subject text NOT NULL CHECK (char_length(subject) >= 1 AND char_length(subject) <= 500),
  message text NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 5000),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS (required for all tables in public schema per Supabase security best practices)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (contact form submissions don't require auth)
-- This uses the anon key which is safe for public-facing forms
CREATE POLICY "Allow anonymous inserts" ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all contacts (e.g., admin dashboard)
CREATE POLICY "Allow authenticated reads" ON public.contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.contacts IS 'Contact form submissions from the mobile app';
