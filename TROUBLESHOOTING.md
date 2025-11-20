# Pipeline - Troubleshooting Guide

## Common Issues and Solutions

### 🔐 Authentication Issues

#### Problem: "Unauthorized" error when accessing /console
**Solution:**
1. Check that you're logged in (try visiting /login)
2. Verify Supabase credentials in `.env.local`
3. Clear browser cookies and cache
4. Try signing out and back in

#### Problem: Google OAuth not working
**Solution:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Ensure Google is enabled
3. Verify Client ID and Client Secret are correct
4. Check authorized redirect URIs include:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
5. Make sure Google+ API is enabled in Google Cloud Console

#### Problem: Redirect loop after login
**Solution:**
1. Check middleware.ts is configured correctly
2. Verify NEXT_PUBLIC_SUPABASE_URL is set
3. Clear all cookies for localhost
4. Restart the development server

### 🗄️ Database Issues

#### Problem: "relation does not exist" error
**Solution:**
1. Go to Supabase SQL Editor
2. Run all commands from `database-updates.sql`
3. Check that tables exist in Database → Tables
4. Verify table names match exactly (case-sensitive)

#### Problem: "permission denied" or RLS errors
**Solution:**
1. Ensure RLS policies were created (check `database-updates.sql`)
2. Verify you're authenticated (check browser console)
3. Check that user_id matches auth.uid()
4. Try disabling RLS temporarily to test:
   ```sql
   ALTER TABLE ai_models DISABLE ROW LEVEL SECURITY;
   ```

#### Problem: Can't insert data into tables
**Solution:**
1. Check RLS INSERT policies exist
2. Verify foreign key constraints are satisfied
3. Check required fields are provided
4. Look at Supabase logs for detailed error

### 🎨 UI/Display Issues

#### Problem: Styles not loading correctly
**Solution:**
1. Restart development server
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `npm install`
4. Check tailwind.config.ts is correct

#### Problem: Charts not displaying
**Solution:**
1. Verify recharts is installed: `npm list recharts`
2. Check browser console for errors
3. Ensure data is in correct format
4. Try refreshing the page

#### Problem: Icons not showing
**Solution:**
1. Verify lucide-react is installed: `npm list lucide-react`
2. Check import statements are correct
3. Clear browser cache

### 📊 Dashboard Issues

#### Problem: Dashboard shows no data
**Solution:**
1. Create a test model first
2. Check database has data: Supabase → Table Editor
3. Verify user_id matches between tables
4. Check browser console for API errors

#### Problem: Stats cards show 0
**Solution:**
1. This is normal if you haven't created any models yet
2. Click "Create ML Model" to add your first model
3. Check that data is being fetched (Network tab)

### 🚀 Training Issues

#### Problem: Training page stuck on "Analyzing"
**Solution:**
1. Check browser console for errors
2. Verify model ID is valid
3. Refresh the page
4. Check that model exists in database

#### Problem: Training progress not updating
**Solution:**
1. This is a simulated training - it should update every 2 seconds
2. Check browser console for errors
3. Verify training_jobs and training_epochs tables exist
4. Try creating a new training job

#### Problem: Charts not updating during training
**Solution:**
1. Ensure recharts is properly installed
2. Check that epoch data is being saved to database
3. Look for JavaScript errors in console
4. Verify data format matches chart expectations

### 🔑 API Key Issues

#### Problem: "Invalid API key" errors
**Solution:**
1. Verify all API keys in `.env.local` are correct
2. Check for extra spaces or quotes
3. Ensure keys are active (not revoked)
4. Restart development server after changing .env.local

#### Problem: Groq API not working
**Solution:**
1. Verify GROQ_API_KEY is set correctly
2. Check API key is active at console.groq.com
3. Verify you haven't exceeded rate limits
4. Try creating a new API key

### 🌐 Deployment Issues

#### Problem: Build fails on Vercel
**Solution:**
1. Check all environment variables are set in Vercel
2. Verify Node.js version is 18+
3. Check build logs for specific errors
4. Try building locally: `npm run build`

#### Problem: Environment variables not working in production
**Solution:**
1. Ensure all variables are set in Vercel/hosting platform
2. Variables starting with NEXT_PUBLIC_ are exposed to browser
3. Redeploy after adding variables
4. Check variable names match exactly

#### Problem: OAuth not working in production
**Solution:**
1. Add production URL to Google OAuth authorized redirects
2. Update Supabase redirect URLs
3. Verify NEXT_PUBLIC_APP_URL is set correctly
4. Check HTTPS is enabled

### 💾 Data Issues

#### Problem: Models not saving
**Solution:**
1. Check form validation is passing
2. Verify all required fields are filled
3. Check browser console for errors
4. Look at Supabase logs
5. Verify RLS policies allow INSERT

#### Problem: Training data not persisting
**Solution:**
1. Check training_jobs table exists
2. Verify training_epochs table exists
3. Check foreign key relationships
4. Look for database errors in console

### 🐛 Development Issues

#### Problem: TypeScript errors
**Solution:**
1. Run `npm install` to ensure all types are installed
2. Check tsconfig.json is correct
3. Restart TypeScript server in VS Code
4. Run `npm run build` to see all errors

#### Problem: Module not found errors
**Solution:**
1. Verify file paths are correct
2. Check file extensions (.tsx, .ts)
3. Ensure imports use correct casing
4. Run `npm install` again

#### Problem: Hot reload not working
**Solution:**
1. Restart development server
2. Check for syntax errors
3. Clear .next folder: `rm -rf .next`
4. Update Next.js: `npm install next@latest`

### 📱 Browser Issues

#### Problem: Page not loading
**Solution:**
1. Check browser console for errors
2. Try different browser
3. Clear cache and cookies
4. Disable browser extensions
5. Check network tab for failed requests

#### Problem: Slow performance
**Solution:**
1. Check Network tab for slow requests
2. Verify database queries are optimized
3. Check for memory leaks in console
4. Try in incognito mode

## Getting More Help

### Check Logs
1. **Browser Console**: F12 → Console tab
2. **Network Tab**: F12 → Network tab
3. **Supabase Logs**: Dashboard → Logs
4. **Vercel Logs**: Deployment → Logs

### Debug Mode
Add to `.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

### Common Commands
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install

# Check for errors
npm run build

# Update dependencies
npm update

# Check package versions
npm list
```

### Still Stuck?

1. Check the README.md for documentation
2. Review SETUP.md for configuration steps
3. Look at PROJECT_STRUCTURE.md to understand the code
4. Check GitHub issues (if applicable)
5. Review Supabase documentation
6. Check Next.js documentation

### Useful Links
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [HuggingFace Docs](https://huggingface.co/docs)

## Prevention Tips

1. **Always check environment variables first**
2. **Run database migrations before starting**
3. **Keep dependencies updated**
4. **Check browser console regularly**
5. **Test in incognito mode to rule out cache issues**
6. **Commit working code frequently**
7. **Read error messages carefully**
8. **Check Supabase logs for backend issues**

Remember: Most issues are related to configuration, not code! 🔧
