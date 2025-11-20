import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrainingClient from '@/components/training/TrainingClient'

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: model } = await supabase
    .from('ai_models')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!model) {
    redirect('/console')
  }

  return <TrainingClient model={model} userId={user.id} />
}
