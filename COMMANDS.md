# Pipeline - Useful Commands

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Install specific package
npm install <package-name>

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Start on different port
PORT=3001 npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## 🧹 Cleanup

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear all caches
rm -rf .next node_modules package-lock.json
npm install
```

## 🗄️ Database (Supabase)

```bash
# These commands are run in Supabase SQL Editor, not terminal

# Run migrations
-- Copy contents of database-updates.sql and run in SQL Editor

# Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

# Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

# View all models
SELECT * FROM ai_models;

# View training jobs
SELECT * FROM training_jobs;

# View training epochs
SELECT * FROM training_epochs;

# Delete all data (careful!)
TRUNCATE ai_models, training_jobs, training_epochs CASCADE;
```

## 🔐 Environment Variables

```bash
# Copy environment template
cp .env.local .env.local.backup

# View environment variables (development)
cat .env.local

# Check if env vars are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## 🐛 Debugging

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check Next.js info
npx next info

# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

## 📊 Testing

```bash
# Test build locally
npm run build
npm start

# Test specific page
curl http://localhost:3000/

# Check if server is running
curl http://localhost:3000/api/models
```

## 🔄 Git Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main

# Create new branch
git checkout -b feature/your-feature

# View status
git status

# View changes
git diff

# Undo changes
git checkout -- .

# View commit history
git log --oneline
```

## 🚀 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

## 📦 Package Management

```bash
# List installed packages
npm list --depth=0

# Check package version
npm list <package-name>

# Install exact version
npm install <package-name>@<version>

# Uninstall package
npm uninstall <package-name>

# Update specific package
npm update <package-name>
```

## 🔍 Inspection

```bash
# Check Next.js version
npx next --version

# Check Node version
node --version

# Check npm version
npm --version

# View package.json scripts
npm run

# Check disk space
npm run build -- --profile
```

## 🧪 Quick Tests

```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
console.log('Supabase client created successfully');
"

# Test environment variables
node -e "
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Groq API Key:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
"
```

## 🔧 Troubleshooting Commands

```bash
# Clear all caches and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check for port conflicts
# Windows
netstat -ano | findstr :3000

# Kill process on port 3000 (Windows)
taskkill /PID <PID> /F

# Check Node memory usage
node --max-old-space-size=4096 node_modules/.bin/next build

# Verbose build output
npm run build -- --debug
```

## 📱 Mobile Testing

```bash
# Find your local IP
# Windows
ipconfig

# Access from mobile
# Use http://<your-ip>:3000
```

## 🎨 Code Quality

```bash
# Format code (if prettier is installed)
npx prettier --write .

# Check TypeScript
npx tsc --noEmit

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint -- --fix
```

## 📊 Performance Analysis

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Check build size
npm run build
du -sh .next

# Lighthouse audit (requires Chrome)
npx lighthouse http://localhost:3000 --view
```

## 🔐 Security

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force

# Check for outdated packages
npm outdated
```

## 📝 Documentation

```bash
# Generate TypeScript types
npx supabase gen types typescript --project-id <project-id>

# View all available scripts
npm run

# View package info
npm info <package-name>
```

## 🎯 Quick Start Commands

```bash
# Complete setup from scratch
npm install
# Configure .env.local
npm run dev
```

## 🚨 Emergency Commands

```bash
# If everything breaks
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# If database is corrupted
# Go to Supabase SQL Editor and run:
# DROP TABLE IF EXISTS ai_models CASCADE;
# Then run database-updates.sql again

# If authentication breaks
# Clear browser cookies for localhost
# Sign out and sign in again
```

## 💡 Pro Tips

```bash
# Run multiple commands
npm run build && npm start

# Run in background (Linux/Mac)
npm run dev &

# Save command output to file
npm run build > build.log 2>&1

# Watch for file changes
npx nodemon --watch . --ext ts,tsx npm run dev
```

## 📚 Learning Commands

```bash
# View Next.js documentation
npx next --help

# View available routes
npm run build
# Check terminal output for route list

# Inspect build output
ls -la .next/

# View environment in browser
# Add to any page: console.log(process.env)
```

## 🎉 Success Commands

```bash
# Everything working? Celebrate!
echo "🎉 Pipeline is running successfully!"

# Check uptime
uptime

# View system info
node -p "process.platform + ' ' + process.arch"
```

Remember: Most issues can be solved by clearing caches and reinstalling! 🔧
