-- Add audit logging trigger for API key operations
-- This helps detect unauthorized access and suspicious activity

-- Create trigger function to log all API key operations
CREATE OR REPLACE FUNCTION public.audit_api_key_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the operation
  INSERT INTO api_key_usage_logs (
    user_wallet,
    api_key_id,
    usage_type,
    success
  ) VALUES (
    COALESCE(NEW.user_wallet, OLD.user_wallet),
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'key_created'
      WHEN 'UPDATE' THEN 'key_updated'
      WHEN 'DELETE' THEN 'key_deleted'
    END,
    true
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS audit_api_key_changes ON public.api_keys;

-- Create trigger for all API key operations
CREATE TRIGGER audit_api_key_changes
AFTER INSERT OR UPDATE OR DELETE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.audit_api_key_operations();

-- Add index for faster log queries
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_wallet_time 
ON api_key_usage_logs(user_wallet, used_at DESC);

-- Add comment
COMMENT ON FUNCTION public.audit_api_key_operations() IS 
'Audit logging for all API key operations (create, update, delete). Logs are stored in api_key_usage_logs table.';