# Pipeline - AI Model Training Platform

World's first fully automated ML platform for training and deploying custom AI models.

## Features

- 🚀 **One-Click Training**: Train custom ML models without writing code
- 🧠 **AI-Powered**: Automated dataset analysis and code generation
- 📊 **Real-time Monitoring**: Live training metrics and visualizations
- 🎯 **Multiple Model Types**: Support for Transformers, LSTM, CNN, and custom architectures
- 🔗 **Easy Deployment**: One-click deployment to HuggingFace Hub
- 📈 **Comprehensive Dashboard**: Track all your models and training jobs

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Google OAuth)
- **ML Framework**: PyTorch (CPU/GPU)
- **AI Models**: Groq (GPT-OSS, Llama), DeepSeek
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- API keys for Groq and DeepSeek

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd pipeline
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
   - Copy \`.env.local\` and fill in your API keys
   - Get Supabase credentials from your Supabase project settings
   - Get Groq API key from https://console.groq.com
   - Get HuggingFace token from https://huggingface.co/settings/tokens

4. Set up Supabase:
   - Go to your Supabase project SQL editor
   - Run the SQL commands in \`database-updates.sql\`
   - Configure Google OAuth in Supabase Authentication settings

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Your Supabase database should already have the required tables. Run the \`database-updates.sql\` file to:
- Add new columns (task_type, target_class)
- Create indexes for better performance
- Set up Row Level Security (RLS) policies
- Add triggers for automatic timestamp updates

## Project Structure

\`\`\`
pipeline/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/                   # Login page
│   ├── console/                 # Dashboard
│   │   ├── page.tsx            # Main dashboard
│   │   ├── create/             # Model creation form
│   │   └── train/[id]/         # Training page
│   ├── api/                     # API routes
│   └── auth/callback/          # OAuth callback
├── components/
│   ├── dashboard/              # Dashboard components
│   └── training/               # Training components
├── lib/
│   └── supabase/               # Supabase client setup
├── types/
│   └── database.types.ts       # TypeScript types
└── public/                     # Static assets
\`\`\`

## Usage

1. **Sign In**: Click "Get Started" and sign in with Google
2. **Create Model**: Click "Create ML Model" in the dashboard
3. **Configure**: Fill in model details, dataset source, and configuration
4. **Train**: Watch real-time training progress with live metrics
5. **Deploy**: Enter your HuggingFace token and deploy with one click

## Supported Models

- Transformers (BERT, GPT, etc.)
- LSTM (Long Short-Term Memory)
- CNN (Convolutional Neural Networks)
- Custom architectures

## Supported Datasets

- HuggingFace Datasets
- Kaggle Datasets
- Custom uploads (coming soon)

## API Keys Required

- **Supabase**: Database and authentication
- **Groq**: AI model inference for code generation
- **DeepSeek**: Additional AI capabilities
- **HuggingFace**: Model deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For support, email support@pipeline.ai or join our Discord community.
