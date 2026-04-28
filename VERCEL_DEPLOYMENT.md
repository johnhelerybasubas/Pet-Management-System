# Vercel Deployment Guide

This project is now configured and ready to deploy to Vercel. Follow these steps:

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier available)
- GitHub repository with this code pushed
- Supabase project (already configured)
- Google OAuth credentials (already configured in Google Cloud Console)
- Gmail App Password (already configured)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import from Git"
3. Connect your GitHub repository
4. Select this project

### 3. Configure Environment Variables in Vercel Dashboard

After selecting the project, go to **Settings > Environment Variables** and add:

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Production, Preview |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Your secure random secret | Production, Preview |
| `GOOGLE_CLIENT_ID` | Your actual Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your actual Google Client Secret | Production, Preview |
| `GMAIL_USER` | `john.basubas@gmail.com` | Production, Preview, Development |
| `GMAIL_APP_PASSWORD` | Your Gmail App Password | Production, Preview |

**Note:** Replace `your-project.vercel.app` with your actual Vercel domain (shown after deployment).

### 4. Deploy

1. Click **Deploy**
2. Wait for the build to complete (~2-3 minutes)
3. Once complete, your app will be live at the provided URL

## Post-Deployment

### Update NEXTAUTH_URL

After deployment:
1. Note your Vercel URL (e.g., `https://pet-management-abc123.vercel.app`)
2. Update `NEXTAUTH_URL` in Vercel dashboard to this URL
3. Trigger a redeploy

### Verify Configuration

1. Visit your deployed app
2. Test login functionality
3. Check that authentication works
4. Verify Google OAuth redirects correctly

## Troubleshooting

### Build Fails with TypeScript Errors
- Run `npm run build` locally to check for errors
- Fix any type errors before pushing to Vercel

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set correctly
- Ensure `NEXTAUTH_URL` matches your Vercel domain exactly
- Check Google OAuth credentials are valid

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Ensure Supabase project is accessible
- Check Row Level Security policies in Supabase

### Email Sending Fails
- Verify Gmail App Password is correct (not regular password)
- Check Gmail account has 2FA enabled
- Ensure app permissions are granted to Vercel IP range

## Local Development

To continue developing locally:

```bash
npm install
npm run dev
```

The app will run on `http://localhost:3000`.

## Additional Resources

- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
