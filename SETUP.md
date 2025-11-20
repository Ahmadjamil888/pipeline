# Pipeline Setup Guide

## Step 1: Environment Variables

1. Open the \`.env.local\` file in the root directory
2. Fill in the following values:

### Supabase Configuration
- Go to your Supabase project: https://supabase.com/dashboard
- Navigate to Settings > API
- Copy the **Project URL** and paste it as \`NEXT_PUBLIC_SUPABASE_URL\`
- Copy the **anon public** key and paste it as \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- Copy the **service_role** key and paste it as \`SUPABASE_SERVICE_ROLE_KEY\`

### Groq API Key
- Go to https://console.groq.com
- Create an account or sign in
- Navigate to API Keys
- Create a new API key
- Copy and paste it as \`GROQ_API_KEY\`

### DeepSeek API Key
- Go to https://platform.deepseek.com
- Create an account or sign in
- Navigate to API Keys
- Create a new API key
- Copy and paste it as \`DEEPSEEK_API_KEY\`

### HuggingFace API Key
- Go to https://huggingface.co/settings/tokens
- Create a new token with write access
- Copy and paste it as \`HUGGINGFACE_API_KEY\`

## Step 2: Database Setup

1. Go to your Supabase project SQL Editor
2. Open the \`database-updates.sql\` file from this project
3. Copy all the SQL commands
4. Paste them into the Supabase SQL Editor
5. Click "Run" to execute the commands

This will:
- Add new columns to existing tables
- Create indexes for better performance
- Set up Row Level Security policies
- Add automatic timestamp triggers

## Step 3: Configure Google OAuth

1. Go to your Supabase project: Authentication > Providers
2. Enable Google provider
3. Follow Supabase's guide to set up Google OAuth:
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
4. Copy the Client ID and Client Secret to Supabase

## Step 4: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 5: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000 in your browser.

## Step 6: Test the Application

1. Click "Get Started" or "Login"
2. Sign in with Google
3. You should be redirected to the dashboard
4. Click "Create ML Model" to test the model creation flow

## Troubleshooting

### Authentication Issues
- Make sure Google OAuth is properly configured in Supabase
- Check that redirect URLs are correct
- Verify environment variables are set correctly

### Database Errors
- Ensure all SQL commands from \`database-updates.sql\` ran successfully
- Check that RLS policies are enabled
- Verify your Supabase service role key is correct

### API Errors
- Verify all API keys are valid and active
- Check API key permissions and quotas
- Look at browser console for detailed error messages

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Other Platforms

Make sure to:
- Set all environment variables
- Configure build command: \`npm run build\`
- Configure start command: \`npm start\`
- Set Node.js version to 18+

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs
3. Verify all environment variables are set
4. Review the README.md for additional information
