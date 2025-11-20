'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Brain, 
  Plus, 
  TrendingUp, 
  Zap, 
  Database,
  Settings,
  CreditCard,
  BarChart3,
  Clock,
  CheckCircle,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import StatsCard from './StatsCard'
import ModelsList from './ModelsList'
import UsageChart from './UsageChart'

interface DashboardClientProps {
  user: any
  models: any[]
  trainingJobs: any[]
  usageStats: any[]
}

export default function DashboardClient({ user, models: initialModels, trainingJobs, usageStats }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [models, setModels] = useState(initialModels)

  const refreshModels = async () => {
    try {
      const { data: updatedModels } = await supabase
        .from('ai_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (updatedModels) {
        setModels(updatedModels)
      }
    } catch (error) {
      console.log('Could not refresh models from database')
      // In demo mode, just remove from current state
      window.location.reload()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'llms', label: 'LLMs', icon: Brain },
    { id: 'in-progress', label: 'In Progress', icon: Clock },
    { id: 'trained', label: 'Trained', icon: CheckCircle },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const completedModels = models.filter(m => m.training_status === 'completed').length
  const inProgressModels = models.filter(m => ['pending', 'initializing', 'training'].includes(m.training_status)).length
  const totalApiCalls = usageStats.length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Pipeline</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'llms' && 'All Models'}
                {activeTab === 'in-progress' && 'Models In Progress'}
                {activeTab === 'trained' && 'Trained Models'}
                {activeTab === 'stats' && 'Statistics'}
                {activeTab === 'billing' && 'Billing'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
            </div>
            {(activeTab === 'dashboard' || activeTab === 'llms') && (
              <button
                onClick={() => router.push('/console/create')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create ML Model</span>
              </button>
            )}
          </div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Models"
                  value={models.length}
                  icon={Brain}
                  color="blue"
                />
                <StatsCard
                  title="In Progress"
                  value={inProgressModels}
                  icon={Clock}
                  color="yellow"
                />
                <StatsCard
                  title="Completed"
                  value={completedModels}
                  icon={CheckCircle}
                  color="green"
                />
                <StatsCard
                  title="API Calls"
                  value={totalApiCalls}
                  icon={Zap}
                  color="purple"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <UsageChart data={usageStats} />
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Activity</h3>
                  <div className="space-y-4">
                    {trainingJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'running' ? 'bg-blue-500' :
                            job.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm text-gray-900">Job {job.id.slice(0, 8)}</span>
                        </div>
                        <span className="text-sm text-gray-600">{job.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Models */}
              <ModelsList models={models.slice(0, 5)} title="Recent Models" onModelDeleted={refreshModels} />
            </>
          )}

          {activeTab === 'llms' && <ModelsList models={models} title="All Models" onModelDeleted={refreshModels} />}
          {activeTab === 'in-progress' && (
            <ModelsList
              models={models.filter(m => ['pending', 'initializing', 'training'].includes(m.training_status))}
              title="Models In Progress"
              onModelDeleted={refreshModels}
            />
          )}
          {activeTab === 'trained' && (
            <ModelsList
              models={models.filter(m => m.training_status === 'completed')}
              title="Trained Models"
              onModelDeleted={refreshModels}
            />
          )}

          {activeTab === 'stats' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
              <p className="text-gray-600">Comprehensive analytics coming soon...</p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
              <p className="text-gray-600">Billing management coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
