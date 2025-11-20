export interface AIModel {
  id: string
  user_id: string
  name: string
  description?: string
  model_type: string
  framework: string
  base_model?: string
  dataset_source?: string
  dataset_name?: string
  training_status: 'pending' | 'initializing' | 'analyzing' | 'training' | 'completed' | 'failed' | 'deployed'
  huggingface_repo?: string
  model_config: any
  training_config: any
  performance_metrics?: any
  file_structure?: any
  created_at: string
  updated_at: string
  deployed_at?: string
  metadata?: any
  training_mode: 'supervised' | 'unsupervised' | 'reinforcement' | 'fine_tuning' | 'custom' | 'auto'
  target_class?: string
  task_type?: 'classification' | 'regression' | 'other'
}

export interface TrainingJob {
  id: string
  user_id: string
  model_id?: string
  status: 'pending' | 'initializing' | 'running' | 'completed' | 'failed'
  progress: number
  current_epoch: number
  total_epochs: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface TrainingEpoch {
  id: string
  training_job_id: string
  epoch_number: number
  loss?: number
  accuracy?: number
  validation_loss?: number
  validation_accuracy?: number
  learning_rate?: number
  timestamp: string
  metadata?: any
}

export interface UserDataset {
  id: string
  user_id: string
  name: string
  description?: string
  file_path: string
  file_size?: number
  file_type?: string
  source_type: 'upload' | 'huggingface' | 'kaggle'
  source_url?: string
  row_count?: number
  column_count?: number
  created_at: string
  updated_at: string
  metadata?: any
}

export interface Billing {
  id: string
  user_id: string
  credits_balance: number
  credits_spent: number
  billing_cycle_start: string
  billing_cycle_end: string
  is_paid: boolean
  created_at: string
  updated_at: string
}
