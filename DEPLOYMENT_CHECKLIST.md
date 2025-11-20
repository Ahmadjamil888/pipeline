# Pipeline - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `GROQ_API_KEY` - Groq API key for AI features
- [ ] `DEEPSEEK_API_KEY` - DeepSeek API key (optional)
- [ ] `HUGGINGFACE_API_KEY` - HuggingFace API key (optional)
- [ ] `NEXT_PUBLIC_APP_URL` - Your app URL (production)

### 2. Supabase Setup
- [ ] Project created on Supabase
- [ ] Database tables exist (run `database-updates.sql`)
- [ ] Row Level Security (RLS) policies enabled
- [ ] Google OAuth configured in Authentication
- [ ] Redirect URLs added for production domain

### 3. Google OAuth Setup
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URIs configured:
  - [ ] `https://yourdomain.com/auth/callback`
  - [ ] Your Supabase callback URL
- [ ] Client ID and Secret added to Supabase

### 4. Code Quality
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All environment variables have placeholders

### 5. Testing
- [ ] Can sign in with Google
- [ ] Dashboard loads correctly
- [ ] Can create a model
- [ ] Training flow works
- [ ] Charts display properly
- [ ] Navigation works

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`
   - Make sure to add for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed site

5. **Update OAuth Redirects**
   - Add Vercel URL to Google OAuth authorized redirects
   - Update Supabase redirect URLs
   - Test authentication

### Option 2: Other Platforms

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables
Add all from .env.local
```

#### Railway
```bash
# Start command
npm start

# Build command
npm run build

# Environment variables
Add all from .env.local
```

#### DigitalOcean App Platform
```yaml
name: pipeline
services:
  - name: web
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    envs:
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: ${NEXT_PUBLIC_SUPABASE_URL}
      # Add all other env vars
```

## 🔒 Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Row Level Security enabled on all tables
- [ ] Service role key is kept secret
- [ ] HTTPS enabled on production domain
- [ ] OAuth redirect URLs are whitelisted
- [ ] CORS configured properly

## 📊 Post-Deployment Checklist

### 1. Verify Functionality
- [ ] Landing page loads
- [ ] Can sign in with Google
- [ ] Dashboard displays correctly
- [ ] Can create a model
- [ ] Training flow works end-to-end
- [ ] Charts render properly
- [ ] All navigation works

### 2. Performance
- [ ] Page load times are acceptable
- [ ] Images are optimized
- [ ] No console errors
- [ ] Database queries are fast

### 3. Monitoring
- [ ] Check Vercel/hosting logs
- [ ] Monitor Supabase logs
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor API usage

### 4. SEO (Optional)
- [ ] Add meta tags
- [ ] Add favicon
- [ ] Add robots.txt
- [ ] Add sitemap.xml
- [ ] Configure Open Graph tags

## 🐛 Common Deployment Issues

### Build Fails
**Problem**: Build fails with environment variable errors
**Solution**: 
- Ensure all required env vars are set
- Use placeholder URLs for build (like in .env.local)
- Check for typos in variable names

### Authentication Not Working
**Problem**: Can't sign in after deployment
**Solution**:
- Add production URL to Google OAuth redirects
- Update Supabase redirect URLs
- Check environment variables are set correctly
- Verify HTTPS is enabled

### Database Errors
**Problem**: "relation does not exist" errors
**Solution**:
- Run `database-updates.sql` in Supabase
- Check RLS policies are enabled
- Verify service role key is correct

### API Errors
**Problem**: API calls failing
**Solution**:
- Check API keys are valid
- Verify rate limits aren't exceeded
- Check CORS configuration
- Look at hosting platform logs

## 📈 Optimization Tips

### Performance
- Enable Next.js Image Optimization
- Use CDN for static assets
- Enable caching headers
- Optimize database queries
- Add indexes to frequently queried columns

### Monitoring
- Set up Vercel Analytics
- Add error tracking (Sentry)
- Monitor Supabase usage
- Track API costs

### Scaling
- Upgrade Supabase plan if needed
- Consider database connection pooling
- Implement rate limiting
- Add caching layer (Redis)

## 🎯 Production Readiness Score

Rate each item (0-10):
- [ ] Environment variables configured: ___/10
- [ ] Database setup complete: ___/10
- [ ] Authentication working: ___/10
- [ ] All features tested: ___/10
- [ ] Error handling implemented: ___/10
- [ ] Security measures in place: ___/10
- [ ] Performance optimized: ___/10
- [ ] Monitoring set up: ___/10

**Total Score: ___/80**

- 70-80: Ready for production! 🚀
- 60-69: Almost there, fix critical issues
- Below 60: More work needed before deployment

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq API Docs](https://console.groq.com/docs)

## 🎉 Launch Day!

Once everything is checked:
1. Deploy to production
2. Test all features
3. Monitor for errors
4. Share with users
5. Celebrate! 🎊

Remember: You can always iterate and improve after launch!
