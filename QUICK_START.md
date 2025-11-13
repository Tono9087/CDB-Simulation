# 🚀 Quick Start Guide

Get your phishing simulation up and running in minutes!

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ MongoDB Atlas account created
- ✅ Vercel account created (for deployment)

---

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Build a Database" → Choose "Free" (M0)
3. Select your cloud provider and region
4. Click "Create Cluster"
5. Go to "Database Access" → Add Database User:
   - Username: `apex-user`
   - Password: (generate secure password)
   - Role: "Read and write to any database"
6. Go to "Network Access" → Add IP Address:
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP
7. Go to "Database" → Click "Connect" → "Connect your application"
8. Copy the connection string

### 3️⃣ Configure Environment Variables

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and paste your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://apex-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/apex-db?retryWrites=true&w=majority
DASHBOARD_PASSWORD=admin2024
VITE_API_URL=http://localhost:5173
```

**Replace:**
- `YOUR_PASSWORD` with the password you created
- `cluster0.xxxxx` with your actual cluster URL

### 4️⃣ Test Locally

#### Option A: Vite Dev Server (Frontend Only)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Note:** API functions won't work in this mode.

#### Option B: Vercel Dev (Full Stack - Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Run development server
vercel dev
```

Open [http://localhost:3000](http://localhost:3000)

**This is the recommended way** as it tests serverless functions locally.

### 5️⃣ Test the Application

1. **Test Phishing Page:**
   - Visit `http://localhost:3000/`
   - Complete the simulation
   - Verify educational alerts appear

2. **Test Dashboard:**
   - Visit `http://localhost:3000/dashboard`
   - Enter password: `admin2024`
   - Verify stats are displayed

3. **Test API:**
   - Check browser console for API responses
   - Verify MongoDB has data in `apex-db.victims` collection

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Easiest)

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
- Link to existing project? **No**
- What's the name? **ciberseguridad-demo** (or your choice)
- Which directory is your code in? **./** (press Enter)

### Option 2: GitHub + Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     ```
     MONGODB_URI = mongodb+srv://...
     DASHBOARD_PASSWORD = admin2024
     ```
   - Click "Save"

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `https://your-project.vercel.app`

---

## 🧪 Testing Deployment

After deployment, test these URLs:

1. **Phishing Page:**
   - `https://your-project.vercel.app/`
   - Should show loading → glitch → warning → form

2. **Dashboard:**
   - `https://your-project.vercel.app/dashboard`
   - Enter password to access

3. **API Endpoints:**
   - Test by submitting the form
   - Check MongoDB for new documents

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** "MongoServerError: bad auth"

**Fix:**
1. Check username and password in connection string
2. Verify database user has correct permissions
3. Make sure you replaced `<password>` in the connection string

**Error:** "Connection timeout"

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Add your IP or use `0.0.0.0/0` for all IPs
3. Wait 1-2 minutes for changes to propagate

### Vercel Deployment Issues

**Error:** "Environment variable not found"

**Fix:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add all required variables
3. Redeploy the project

**Error:** "Function execution timeout"

**Fix:**
1. Check MongoDB connection is working
2. Verify `vercel.json` has correct function configuration
3. Check Vercel function logs for details

### API Not Working Locally

**Problem:** API calls return 404

**Fix:**
- Use `vercel dev` instead of `npm run dev`
- Vercel dev properly handles serverless functions

---

## 📝 Post-Deployment Checklist

- [ ] Phishing page loads correctly
- [ ] Form submission works
- [ ] Educational alerts appear after submission
- [ ] Dashboard is accessible with password
- [ ] Stats are displayed correctly
- [ ] MongoDB is receiving data
- [ ] CSV export works
- [ ] Clear database function works

---

## 🎓 For Your Presentation

### Demo Flow

1. **Introduction (2 min)**
   - Explain the educational purpose
   - Mention it's a controlled simulation

2. **Live Demo (5 min)**
   - Show the phishing page
   - Walk through the simulation
   - Submit fake credentials
   - Show the educational alerts

3. **Dashboard (3 min)**
   - Open dashboard
   - Show collected data
   - Explain what each metric means
   - Demonstrate export functionality

4. **Technical Explanation (3 min)**
   - Show code snippets
   - Explain fingerprinting techniques
   - Discuss the technology stack

5. **Security Lessons (2 min)**
   - Review what users learned
   - Discuss protection strategies
   - Answer questions

### Demo Tips

- ✅ Use incognito mode for fresh simulation
- ✅ Have MongoDB dashboard open to show real-time data
- ✅ Prepare a script for consistent presentation
- ✅ Have backup screenshots in case of network issues
- ✅ Emphasize the educational purpose throughout

---

## 🔧 Customization

### Change Dashboard Password

1. Edit `.env`:
   ```env
   DASHBOARD_PASSWORD=your_new_password
   ```

2. For Vercel, update environment variable in dashboard

### Change Branding

Edit these files:
- `src/pages/PhishingPage.jsx` - Main page text
- `src/index.css` - Colors and styles
- `tailwind.config.js` - Color theme

### Add More Data Points

1. Add to `src/utils/fingerprint.js`
2. Update `api/capture.js` to save it
3. Add to dashboard display

---

## 📞 Need Help?

### Common Issues

1. **"Cannot find module"** → Run `npm install`
2. **"Port already in use"** → Kill the process or use different port
3. **"CORS error"** → Check Vercel CORS settings
4. **"MongoDB timeout"** → Check network access settings

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

## ✅ You're Ready!

Your phishing simulation is now ready for educational demonstrations!

**Remember:**
- Always disclose the educational purpose
- Use in controlled environments
- Delete data after presentations
- Follow ethical guidelines

**Good luck with your presentation! 🎉**
