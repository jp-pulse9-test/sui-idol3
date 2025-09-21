-- Fix security issue: Remove public access to sensitive idol data
-- Keep the public views for non-sensitive data access

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read access" ON public.idols;

-- The remaining policies ensure:
-- 1. "Only authenticated users can view full idol data" - for full access when logged in
-- 2. "Only authenticated users can manage idols" - for modifications

-- Ensure public views remain accessible (they don't have RLS by default)
-- idols_public view already exposes only: id, name, gender, category, concept, profile_image, created_at
-- idols_basic_public view exposes only: id, name, profile_image, created_at

-- Verify the get_public_idols() function works correctly for public access
-- This function returns only non-sensitive public data