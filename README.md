# 🎓 Ciberseguridad del Bienestar - Educational Phishing Simulation

![License: Educational](https://img.shields.io/badge/License-Educational-yellow.svg)
![Purpose: Academic](https://img.shields.io/badge/Purpose-Academic-blue.svg)
![Status: Prototype](https://img.shields.io/badge/Status-Prototype-orange.svg)

> ⚠️ **EDUCATIONAL PROJECT WARNING**
>
> This project is designed exclusively for educational purposes as part of a cybersecurity awareness academic initiative. It must NOT be used for malicious activities, unauthorized testing, or any illegal purposes.

## 📋 Table of Contents

- [About](#about)
- [Educational Purpose](#educational-purpose)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Ethical Guidelines](#ethical-guidelines)
- [Legal Disclaimer](#legal-disclaimer)
- [Security Features](#security-features)
- [How It Works](#how-it-works)
- [Dashboard](#dashboard)
- [Learning Outcomes](#learning-outcomes)
- [Contributing](#contributing)
- [Credits](#credits)

---

## 🎯 About

**Ciberseguridad del Bienestar** is an academic cybersecurity project that simulates a phishing attack to educate users about:

- Social engineering tactics
- Browser fingerprinting techniques
- Credential harvesting methods
- Privacy implications of data collection
- How to recognize and avoid phishing attempts

This project was originally created for a workshop challenge and is now being used as a school project prototype for educational presentations.

## 🎓 Educational Purpose

### Primary Goals:

1. **Raise Awareness**: Help users understand the dangers of phishing attacks
2. **Demonstrate Techniques**: Show real-world attack methods in a safe environment
3. **Teach Protection**: Educate on how to identify and avoid phishing attempts
4. **Privacy Education**: Illustrate how much data can be collected without explicit consent

### Target Audience:

- Students learning about cybersecurity
- General public for security awareness training
- Academic institutions for educational demonstrations
- Security workshops and conferences

### What This Is NOT:

- ❌ A tool for actual phishing attacks
- ❌ A penetration testing framework
- ❌ Software for unauthorized data collection
- ❌ A malicious hacking tool

---

## ✨ Features

### Phishing Simulation Page

- **Realistic UI**: Mimics Apex Legends branding for demonstration
- **Social Engineering**: Uses urgency and fake rewards to create pressure
- **Data Collection**: Demonstrates various fingerprinting techniques
- **Educational Alerts**: Shows 6 sequential alerts explaining what happened
- **Immediate Disclosure**: Users are instantly informed it's a simulation

### Data Collection (Educational Demonstration)

The simulation collects the following data to demonstrate privacy risks:

- **Browser Information**: User agent, language, platform
- **Device Information**: Screen resolution, CPU cores, memory
- **Network Information**: IP address, geolocation (with permission)
- **Behavioral Data**: Mouse movements, clicks, scroll patterns
- **Fingerprints**: Canvas, WebGL, Audio fingerprints
- **Form Data**: Email and password (hashed immediately)

### Analytics Dashboard

- **Real-time Statistics**: Total victims, success rate, average time
- **Geographic Analysis**: Top countries and cities
- **Device Breakdown**: Mobile vs Desktop vs Tablet
- **Timeline Charts**: Attempts over 24-hour period
- **Victim Table**: Detailed view with search and pagination
- **CSV Export**: Download data for further analysis

---

## 🛠 Technology Stack

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization

### Backend
- **Vercel Serverless Functions**: API endpoints
- **MongoDB Atlas**: Database storage
- **bcryptjs**: Password hashing
- **UA Parser**: User agent parsing

### Deployment
- **Vercel**: Hosting platform

---

## 📁 Project Structure

```
phishing-educativo/
├── src/
│   ├── pages/
│   │   ├── PhishingPage.jsx          # Main simulation page
│   │   └── Dashboard.jsx             # Analytics dashboard
│   │
│   ├── components/
│   │   ├── StatsCard.jsx             # Statistics card component
│   │   ├── VictimTable.jsx           # Victims data table
│   │   └── Charts/
│   │       ├── LocationChart.jsx     # Geographic bar chart
│   │       ├── TimelineChart.jsx     # Time-series line chart
│   │       └── DeviceChart.jsx       # Device pie chart
│   │
│   ├── utils/
│   │   ├── api.js                    # API client functions
│   │   └── fingerprint.js            # Browser fingerprinting utils
│   │
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # App entry point
│   └── index.css                     # Global styles
│
├── api/
│   ├── _mongodb.js                   # MongoDB connection utility
│   ├── capture.js                    # POST /api/capture - Save data
│   ├── stats.js                      # GET /api/stats - Statistics
│   ├── victims.js                    # GET /api/victims - List victims
│   └── clear.js                      # DELETE /api/clear - Clear DB
│
├── public/
│   └── assets/                       # Static assets
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── vercel.json                       # Vercel configuration
├── package.json                      # Dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind configuration
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Vercel account (for deployment)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd CDB-Simulation
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apex-db?retryWrites=true&w=majority

# Dashboard Authentication
DASHBOARD_PASSWORD=admin2024

# Development API URL
VITE_API_URL=http://localhost:5173
```

---

## ⚙️ Configuration

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free M0 tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env`

The database will automatically create the `apex-db` database and `victims` collection with appropriate indexes.

### Dashboard Password

The default password is `admin2024`. Change it in:
- `.env` file: `DASHBOARD_PASSWORD=your_secure_password`
- For production, set it in Vercel environment variables

---

## 💻 Local Development

### Run Development Server

```bash
npm run dev
```

This starts Vite dev server at `http://localhost:5173`

**Note**: API functions won't work in dev mode without additional setup.

### Test with Vercel Dev (Recommended)

To test serverless functions locally:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run Vercel dev server
vercel dev
```

This runs the full stack locally with serverless function support.

### Access Points

- **Phishing Page**: `http://localhost:5173/`
- **Dashboard**: `http://localhost:5173/dashboard`
- **API Endpoints**: `http://localhost:5173/api/*`

---

## 🌐 Deployment

### Deploy to Vercel

#### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

### Set Environment Variables in Vercel

Go to your project settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://...
DASHBOARD_PASSWORD = admin2024
```

### Post-Deployment

1. Test the phishing page at your Vercel URL
2. Verify API endpoints are working
3. Check MongoDB connection
4. Test dashboard access

---

## ⚖️ Ethical Guidelines

### ✅ Acceptable Uses

- Educational demonstrations in academic settings
- Security awareness training with informed participants
- Research projects with proper institutional approval
- Cybersecurity workshops and conferences
- Personal education about phishing techniques

### ❌ Prohibited Uses

- Actual phishing attacks on unsuspecting victims
- Credential theft or unauthorized access attempts
- Deployment without clear educational context
- Use against individuals without consent
- Any illegal or malicious activities

### 📜 Best Practices

1. **Always disclose educational purpose** immediately after interaction
2. **Obtain consent** from participants when possible
3. **Use in controlled environments** (classrooms, workshops)
4. **Don't distribute captured data** outside educational context
5. **Delete data regularly** after demonstrations
6. **Include clear disclaimers** on the page
7. **Never target vulnerable populations** without safeguards

---

## ⚠️ Legal Disclaimer

```
IMPORTANT LEGAL NOTICE:

This software is provided for EDUCATIONAL PURPOSES ONLY. The creators and
contributors of this project:

1. Do NOT authorize or condone the use of this software for malicious purposes
2. Are NOT responsible for misuse or illegal activities performed with this code
3. Assume NO liability for any damages or legal consequences resulting from
   improper use

By using this software, you agree to:

- Use it only for legitimate educational purposes
- Comply with all applicable laws and regulations
- Obtain necessary permissions before deployment
- Take full responsibility for your actions

Unauthorized access to computer systems is illegal in most jurisdictions.
Always obtain explicit permission before testing security on any system
you do not own.

The demonstration of phishing techniques is for educational awareness only.
Using these techniques against real users without consent is illegal and
unethical.
```

---

## 🔒 Security Features

### Data Protection

1. **Password Hashing**: All passwords are hashed with bcrypt before storage
2. **No Plaintext Storage**: Sensitive data is never stored in plaintext
3. **Rate Limiting**: 10 requests per hour per IP to prevent abuse
4. **Input Validation**: All inputs are validated and sanitized

### Privacy Considerations

1. **Immediate Disclosure**: Users are informed it's a simulation
2. **Data Minimization**: Only collect data necessary for demonstration
3. **Temporary Storage**: Data should be cleared after demonstrations
4. **No Third-Party Sharing**: Data stays within the educational context

### Technical Security

1. **Environment Variables**: Sensitive configs not in codebase
2. **HTTPS Only**: Enforce secure connections in production
3. **CORS Protection**: Proper CORS configuration
4. **MongoDB Authentication**: Database requires authentication

---

## 🔍 How It Works

### 1. Initial Load

User visits the phishing page, which shows:
- Loading screen with spinner
- Glitch effects with Apex Legends branding
- Warning screen with countdown (creates urgency)

### 2. Form Presentation

Login form is displayed with:
- Fake rewards offer (social engineering)
- Professional-looking UI (mimics legitimate site)
- Trust indicators (fake SSL badges)
- Small educational disclaimer in footer

### 3. Data Collection

When user interacts with the page, data is collected:
- Browser fingerprints are generated
- Behavioral patterns are tracked
- Device information is gathered
- Geolocation is requested (with permission)

### 4. Form Submission

When user submits credentials:
- Data is sent to `/api/capture`
- Password is hashed on backend
- IP geolocation is performed
- VPN detection is attempted
- Data is stored in MongoDB

### 5. Educational Revelation

Immediately after submission:
- Terminal animation shows "hacking" sequence
- 6 sequential alerts explain each technique
- Educational message explains the risks
- Option to learn more about cybersecurity

### 6. Dashboard Analytics

Administrators can view:
- Aggregated statistics
- Individual victim details
- Geographic distribution
- Device and browser breakdown
- Time-series data

---

## 📊 Dashboard

### Access

- **URL**: `/dashboard`
- **Default Password**: `admin2024`

### Features

#### Statistics Cards
- Total victims count
- Success rate percentage
- Average time on page
- Unique locations
- VPN users detected
- Device type breakdown

#### Charts
- **Timeline Chart**: Shows attempts over 24 hours
- **Device Chart**: Pie chart of mobile/desktop/tablet
- **Location Charts**: Top countries and cities

#### Victims Table
- Sortable and searchable
- Pagination support
- Shows: timestamp, email, IP, location, browser, device, time
- VPN detection indicator
- Export to CSV functionality

#### Actions
- **Refresh**: Manual refresh of data
- **Auto-refresh**: Toggle 30-second auto-refresh
- **Clear DB**: Delete all data (requires confirmation)
- **Export CSV**: Download all data

---

## 🎯 Learning Outcomes

After experiencing this simulation, users will understand:

### 1. Social Engineering Tactics
- Urgency and pressure tactics
- Fake rewards and incentives
- Authority impersonation
- Trust indicator manipulation

### 2. Technical Attack Methods
- Browser fingerprinting techniques
- Behavioral tracking
- IP geolocation
- WebRTC IP leaks
- Credential harvesting

### 3. Privacy Implications
- How much data browsers expose
- Tracking without cookies
- Unique device identification
- Location data risks

### 4. Protection Strategies
- URL verification importance
- Password manager benefits
- 2FA necessity
- Skepticism of urgency
- Safe browsing habits

---

## 📚 Educational Resources

### Recommended Reading

- [Phishing.org](https://www.phishing.org/) - Anti-Phishing resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security
- [EFF Privacy Guide](https://www.eff.org/issues/privacy) - Digital privacy
- [StaySafeOnline.org](https://staysafeonline.org/) - Cybersecurity tips

### Related Topics

- Social Engineering
- Browser Fingerprinting
- Privacy-Preserving Technologies
- Multi-Factor Authentication
- Password Management
- Secure Communication

---

## 🤝 Contributing

This is an educational project. Contributions that enhance the educational value are welcome:

### Areas for Improvement

- Additional phishing scenarios
- More fingerprinting techniques (for demonstration)
- Enhanced analytics visualizations
- Multilingual support
- Accessibility improvements
- Documentation enhancements

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

**Important**: All contributions must maintain the educational focus and ethical boundaries of this project.

---

## 👥 Credits

### Project Team

**Ciberseguridad del Bienestar Team**
- Academic Institution: [Your School Name]
- Course: [Course Name]
- Semester: [Semester/Year]

### Acknowledgments

- Apex Legends branding used for educational demonstration only
- All trademarks are property of their respective owners
- Inspired by real-world phishing research
- Built with open-source technologies

### Technologies Used

- React, Vite, Tailwind CSS
- Vercel, MongoDB Atlas
- Recharts, React Router
- Various npm packages (see package.json)

---

## 📞 Contact

For educational inquiries or responsible disclosure:

- **Project Purpose**: Academic Cybersecurity Education
- **Institution**: [Your School]
- **Email**: [Contact Email]

---

## 📄 License

This project is licensed for **educational use only**.

```
Educational Use License

Permission is granted to use this software for educational purposes only,
including academic research, security training, and awareness demonstrations
in controlled environments with informed participants.

All other rights are reserved. Commercial use, malicious deployment, or
any illegal activities are strictly prohibited.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## 🔄 Version History

- **v1.0.0** (2024) - Initial release for workshop
- **v2.0.0** (Current) - React/Vercel rewrite for school project

---

## ✅ Project Checklist

Before deploying or demonstrating:

- [ ] MongoDB Atlas cluster is configured
- [ ] Environment variables are set
- [ ] Dashboard password is changed from default
- [ ] Educational disclaimers are visible
- [ ] Participants are informed of the educational nature
- [ ] Data retention policy is established
- [ ] Legal compliance is verified
- [ ] Ethical guidelines are reviewed
- [ ] Responsible adult supervision is present (for student demos)
- [ ] Plan for data deletion after demonstration

---

## 🙏 Final Notes

This project was created with the goal of making the internet safer by educating users about phishing attacks. We believe that understanding attack methods is crucial for developing effective defenses.

**Remember**: The goal is education, not exploitation. Use responsibly.

**Stay safe online! 🛡️**

---

*Last Updated: 2024*
*Project Status: Educational Prototype*
*Maintained by: Ciberseguridad del Bienestar Team*
