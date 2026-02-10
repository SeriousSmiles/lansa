
-- Payments table for one-time payments (certification exams, etc.)
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('certification_exam', 'employer_subscription', 'mentor_subscription')),
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'XCG',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  provider text NOT NULL DEFAULT 'sentoo',
  provider_payment_id text,
  provider_metadata jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz
);

-- Subscriptions table for recurring payments
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('employer_basic', 'employer_premium', 'mentor_starter', 'mentor_pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'XCG',
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can read their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can insert/update (edge functions use service role)
-- No insert/update policies for authenticated users - only via edge functions
