# 🔗 How to Get Your Render App URL

## After Deploying to Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Login to your account

2. **Find Your Service**
   - Click on your PaperFlow backend service
   - Look for the service name (e.g., `paperflow-backend-xyz`)

3. **Get the URL**
   - Your app URL will be: `https://[service-name].onrender.com`
   - Example: `https://paperflow-backend-abc123.onrender.com`

4. **Test Your Deployment**
   ```bash
   # Replace with your actual URL
   python check_deployment.py https://paperflow-backend-abc123.onrender.com
   ```

## Common Render URLs

Your URL will look like one of these:
- `https://paperflow-backend-xyz.onrender.com`
- `https://research-paper-backend-abc.onrender.com`
- `https://your-chosen-name.onrender.com`

## Quick Test Commands

```bash
# Test with your actual URL
python verify_deployment.py https://your-actual-app.onrender.com

# Or use the comprehensive checker
python check_deployment.py https://your-actual-app.onrender.com

# Test locally first
python test_local.py
```

## If You Don't Have a Render App Yet

1. **Deploy to Render:**
   - Push your code to GitHub
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

2. **Set Environment Variables:**
   - `GROQ_API_KEY=your_groq_key`
   - `GEMINI_API_KEY=your_gemini_key`

3. **Deploy and Get URL:**
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the generated URL

## Troubleshooting

### If URL Returns 404:
- Check if deployment is complete
- Verify the service is running in Render dashboard
- Make sure you're using the correct URL

### If URL Returns 500:
- Check Render logs for errors
- Verify environment variables are set
- Try redeploying

### If URL Times Out:
- Render free tier spins down after 15 minutes
- First request after spin-down takes ~30 seconds
- Try again after waiting