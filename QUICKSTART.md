# Pipeline - Quick Start Guide

Get your AI model training platform running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- A Groq API account (free tier available)

## Step 1: Install Dependencies (1 minute)

\`\`\`bash
cd pipeline
npm install
\`\`\`

## Step 2: Configure Supabase (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Go to **Settings > API**
4. Copy these values to \`.env.local\`:
   - Project URL → \`NEXT_PUBLIC_SUPABASE_URL\`
   - anon public key → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - service_role key → \`SUPABASE_SERVICE_ROLE_KEY\`

5. Go to **SQL Editor** and run the contents of \`database-updates.sql\`

6. Go to **Authentication > Providers**
   - Enable Google provider
   - Follow the setup wizard to configure Google OAuth

## Step 3: Get API Keys (1 minute)

### Groq API Key (Required)
1. Go to [Groq Console](https://console.groq.com)
2. Sign up/Login
3. Create an API key
4. Add to \`.env.local\` as \`GROQ_API_KEY\`

### Optional Keys
- **DeepSeek**: Get from [DeepSeek Platform](https://platform.deepseek.com)
- **HuggingFace**: Get from [HF Settings](https://huggingface.co/settings/tokens)

## Step 4: Run the App (1 minute)

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test It Out!

1. Click **"Get Started"**
2. Sign in with Google
3. You'll be redirected to the dashboard
4. Click **"Create ML Model"**
5. Fill in the form:
   - Name: "My First Model"
   - Model Type: "Transformer"
   - Task Type: "Classification"
   - Target Class: "label"
   - Dataset Source: "HuggingFace"
   - Dataset URL: "imdb"
6. Click **"Train & Deploy"**
7. Watch the magic happen! ✨

## What You'll See

### Stage 1: Analyzing (2 seconds)
- AI analyzes your dataset
- Generates training code
- Shows dataset statistics

### Stage 2: Configuring
- Set number of epochs (default: 10)
- Set batch size (default: 32)
- Set learning rate (default: 0.001)
- Click "Start Training"

### Stage 3: Training (20 seconds)
- Real-time progress bar
- Live metrics (loss, accuracy)
- Dynamic charts updating
- 4 model checkpoints

### Stage 4: Completed
- Final accuracy and loss
- Deploy to HuggingFace option
- Test model interface

## Troubleshooting

### "Unauthorized" Error
- Check Supabase credentials in \`.env.local\`
- Make sure Google OAuth is configured
- Try signing out and back in

### Database Errors
- Ensure \`database-updates.sql\` was run successfully
- Check Supabase logs in the dashboard
- Verify RLS policies are enabled

### Can't Sign In
- Verify Google OAuth is enabled in Supabase
- Check redirect URLs are correct
- Clear browser cookies and try again

## Next Steps

- Explore the dashboard tabs (LLMs, Stats, etc.)
- Create multiple models
- Check out the real-time charts
- Deploy a model to HuggingFace

## Need Help?

- Check \`README.md\` for detailed documentation
- Review \`SETUP.md\` for comprehensive setup guide
- Check \`PROJECT_STRUCTURE.md\` to understand the codebase

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

That's it! You now have a fully functional AI model training platform. 🚀
