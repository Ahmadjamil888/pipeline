# Pipeline Project Structure

## Overview
Pipeline is a comprehensive Next.js application for training and deploying AI models with a professional white and blue theme.

## Directory Structure

\`\`\`
pipeline/
│
├── app/                                    # Next.js App Router
│   ├── page.tsx                           # Landing page with hero section
│   ├── layout.tsx                         # Root layout
│   ├── globals.css                        # Global styles
│   │
│   ├── login/
│   │   └── page.tsx                       # Google OAuth login page
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                   # OAuth callback handler
│   │
│   ├── console/
│   │   ├── page.tsx                       # Main dashboard (server component)
│   │   ├── create/
│   │   │   └── page.tsx                   # Model creation form
│   │   └── train/
│   │       └── [id]/
│   │           └── page.tsx               # Training page with real-time updates
│   │
│   └── api/
│       ├── models/
│       │   └── route.ts                   # Models API endpoints
│       └── training/
│           └── [id]/
│               └── route.ts               # Training job API
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardClient.tsx           # Main dashboard client component
│   │   ├── StatsCard.tsx                 # Statistics card component
│   │   ├── ModelsList.tsx                # Models list with status
│   │   └── UsageChart.tsx                # API usage chart (Recharts)
│   │
│   └── training/
│       ├── TrainingClient.tsx            # Training orchestration
│       ├── TrainingSteps.tsx             # Step indicator
│       ├── DatasetAnalysis.tsx           # Dataset analysis display
│       ├── EpochConfiguration.tsx        # Training config form
│       ├── TrainingProgress.tsx          # Real-time training metrics
│       └── DeploymentForm.tsx            # HuggingFace deployment
│
├── lib/
│   └── supabase/
│       ├── client.ts                     # Browser Supabase client
│       ├── server.ts                     # Server Supabase client
│       └── middleware.ts                 # Auth middleware
│
├── types/
│   └── database.types.ts                 # TypeScript interfaces
│
├── middleware.ts                          # Next.js middleware for auth
├── next.config.ts                         # Next.js configuration
├── tailwind.config.ts                     # Tailwind CSS config
├── tsconfig.json                          # TypeScript config
├── .env.local                             # Environment variables (not in git)
├── .gitignore                             # Git ignore rules
│
├── database-updates.sql                   # SQL migration script
├── README.md                              # Project documentation
├── SETUP.md                               # Setup instructions
└── PROJECT_STRUCTURE.md                   # This file
\`\`\`

## Key Features by Page

### Landing Page (\`/\`)
- Hero section with CTA
- Feature grid (4 features)
- Secondary CTA section
- Professional white/blue design
- Redirects to login when "Create Your Own AI" clicked

### Login Page (\`/login\`)
- Google OAuth integration
- Clean, centered design
- Redirects to console after login

### Console Dashboard (\`/console\`)
- Sidebar navigation with tabs:
  - Dashboard (default)
  - LLMs (all models)
  - In Progress (training models)
  - Trained (completed models)
  - Stats (analytics)
  - Billing
  - Settings
- Real-time statistics cards
- Usage charts (last 7 days)
- Recent models list
- Training activity feed

### Create Model (\`/console/create\`)
- Model configuration form:
  - Name & description
  - Model type (Transformer, LSTM, CNN, Custom)
  - Task type (Classification, Regression, Other)
  - Target class (for classification)
  - Dataset source (HuggingFace, Kaggle, Upload)
  - Base model for fine-tuning
- Form validation
- Redirects to training page

### Training Page (\`/console/train/[id]\`)
- Multi-stage training flow:
  1. **Analyzing**: AI analyzes dataset
  2. **Configuring**: User sets epochs, batch size, learning rate
  3. **Training**: Real-time progress with:
     - Progress bar
     - Current metrics (loss, accuracy, val_loss, val_accuracy)
     - Live charts (Loss over time, Accuracy over time)
     - Model checkpoints preview
  4. **Completed**: Final metrics and deployment form
- HuggingFace deployment integration

## Database Tables Used

### ai_models
- Stores model configurations
- Training status tracking
- Performance metrics
- Deployment information

### training_jobs
- Training job status
- Progress tracking
- Epoch counting

### training_epochs
- Per-epoch metrics
- Loss and accuracy tracking
- Validation metrics

### model_usage
- API call tracking
- Token usage
- Cost tracking

### users (via Supabase Auth)
- User authentication
- Profile information

## Technology Stack

### Frontend
- **Next.js 15**: App Router, Server Components
- **React 19**: UI components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling (white/blue theme)
- **Recharts**: Data visualization
- **Lucide React**: Icons

### Backend
- **Next.js API Routes**: RESTful endpoints
- **Supabase**: Database, Auth, Real-time
- **PostgreSQL**: Data storage

### AI/ML
- **PyTorch**: Training framework (CPU/GPU)
- **Groq API**: Code generation (GPT-OSS, Llama models)
- **DeepSeek API**: Additional AI capabilities
- **HuggingFace**: Model deployment

### Authentication
- **Supabase Auth**: Google OAuth
- **Row Level Security**: Data protection

## Color Scheme

### Primary Colors
- **Blue**: #2563eb (primary-600)
- **White**: #ffffff (background)
- **Gray**: Various shades for text and borders

### Usage
- Primary actions: Blue buttons
- Backgrounds: White cards with gray borders
- Text: Gray-900 for headings, Gray-600 for body
- Status indicators:
  - Green: Completed
  - Blue: Training/In Progress
  - Yellow: Initializing
  - Red: Failed
  - Gray: Pending

## API Endpoints

### GET /api/models
- Fetch user's models
- Requires authentication

### POST /api/models
- Create new model
- Requires authentication

### GET /api/training/[id]
- Fetch training job details
- Includes epoch data
- Requires authentication

## Environment Variables

Required in \`.env.local\`:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`GROQ_API_KEY\`
- \`DEEPSEEK_API_KEY\`
- \`HUGGINGFACE_API_KEY\`
- \`KAGGLE_USERNAME\` (optional)
- \`KAGGLE_KEY\` (optional)

## Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **Authentication Middleware**: Protected routes
3. **API Key Management**: Secure storage in environment
4. **User Isolation**: Users can only access their own data

## Real-time Features

1. **Training Progress**: Simulated real-time updates
2. **Epoch Tracking**: Live metric updates
3. **Chart Updates**: Dynamic data visualization
4. **Status Changes**: Automatic UI updates

## Future Enhancements

- Actual PyTorch training integration
- File upload for custom datasets
- Model testing interface
- API key management UI
- Billing integration
- Team collaboration
- Model versioning
- A/B testing
- Performance optimization
- Mobile responsive improvements
