import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function ConsolePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's models
  const { data: models } = await supabase
    .from('ai_models')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch training jobs
  const { data: trainingJobs } = await supabase
    .from('training_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch model usage stats
  const { data: usageStats } = await supabase
    .from('model_usage')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <DashboardClient
      user={user}
      models={models || []}
      trainingJobs={trainingJobs || []}
      usageStats={usageStats || []}
    />
  )
}
