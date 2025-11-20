-- Additional updates to existing tables (if needed)
-- Run these commands in your Supabase SQL editor

-- Add task_type column to ai_models if not exists
ALTER TABLE public.ai_models 
ADD COLUMN IF NOT EXISTS task_type TEXT CHECK (task_type IN ('classification', 'regression', 'other'));

-- Add target_class column to ai_models if not exists
ALTER TABLE public.ai_models 
ADD COLUMN IF NOT EXISTS target_class TEXT;

-- Update training_status check constraint to include new statuses
ALTER TABLE public.ai_models 
DROP CONSTRAINT IF EXISTS ai_models_training_status_check;

ALTER TABLE public.ai_models 
ADD CONSTRAINT ai_models_training_status_check 
CHECK (training_status IN ('pending', 'initializing', 'analyzing', 'training', 'completed', 'failed', 'deployed'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_models_user_id ON public.ai_models(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_training_status ON public.ai_models(training_status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_user_id ON public.training_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_model_id ON public.training_jobs(model_id);
CREATE INDEX IF NOT EXISTS idx_training_epochs_job_id ON public.training_epochs(training_job_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_user_id ON public.model_usage(user_id);

-- Enable Row Level Security (RLS) policies
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_epochs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_datasets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_models
CREATE POLICY "Users can view their own models" ON public.ai_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own models" ON public.ai_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" ON public.ai_models
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" ON public.ai_models
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training_jobs
CREATE POLICY "Users can view their own training jobs" ON public.training_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training jobs" ON public.training_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training jobs" ON public.training_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for training_epochs
CREATE POLICY "Users can view epochs for their training jobs" ON public.training_epochs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_jobs
      WHERE training_jobs.id = training_epochs.training_job_id
      AND training_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert epochs for their training jobs" ON public.training_epochs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_jobs
      WHERE training_jobs.id = training_epochs.training_job_id
      AND training_jobs.user_id = auth.uid()
    )
  );

-- RLS Policies for user_datasets
CREATE POLICY "Users can view their own datasets" ON public.user_datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets" ON public.user_datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" ON public.user_datasets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" ON public.user_datasets
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_jobs_updated_at ON public.training_jobs;
CREATE TRIGGER update_training_jobs_updated_at
    BEFORE UPDATE ON public.training_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
