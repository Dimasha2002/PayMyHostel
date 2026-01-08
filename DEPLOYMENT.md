# Deployment Guide - Render

## Prerequisites
1. MongoDB Atlas account (free tier available)
2. Render account (free tier available)
3. GitHub repository with your code

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (allows access from anywhere)
5. Get your connection string

## Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `paymyhostel-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_here
   JWT_EXPIRE=7d
   FRONTEND_URL=your_frontend_url_will_add_later
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://paymyhostel-backend.onrender.com`)

## Step 3: Deploy Frontend on Render

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `paymyhostel-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend/Hostel`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

6. Click "Create Static Site"
7. Wait for deployment
8. Copy your frontend URL

## Step 4: Update Backend CORS

1. Go back to your backend service on Render
2. Add/Update environment variable:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
3. Save and redeploy

## Step 5: Test Your Application

1. Visit your frontend URL
2. Try registering a new account
3. Test login functionality
4. Check if all features work

## Important Notes

### Free Tier Limitations:
- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month free

### File Uploads:
- Uploaded files (payment slips) will be lost when service restarts
- Consider using cloud storage (Cloudinary, AWS S3) for production

### MongoDB Atlas:
- Free tier: 512 MB storage
- Remember to whitelist IP: `0.0.0.0/0`

## Troubleshooting

### Backend won't start:
- Check environment variables are set correctly
- Check MongoDB connection string
- Check logs on Render dashboard

### Frontend can't connect to backend:
- Verify VITE_API_URL is correct
- Check CORS configuration
- Check network tab in browser console

### CORS Errors:
- Ensure FRONTEND_URL is set in backend
- Check browser console for exact error

## Local Development

Create `.env` files based on `.env.example`:

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_local_or_atlas_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

## Support

If you encounter issues:
1. Check Render logs
2. Check browser console
3. Verify environment variables
4. Test API endpoints directly
