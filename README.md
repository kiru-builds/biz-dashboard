# 📈 ProfitPulse AI — E-Commerce Profit Optimization SaaS

![ProfitPulse](https://img.shields.io/badge/ProfitPulse-SaaS%20v4.0-00ff87?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Claude AI](https://img.shields.io/badge/Claude-AI%20Powered-7c3aed?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

> **Live Demo → [profitpulse-sandy.vercel.app](https://profitpulse-sandy.vercel.app/)**

A premium AI-powered business analytics dashboard built for e-commerce businesses. Upload your sales data, get instant AI insights, revenue forecasts, and smart alerts — all in one place.

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards — Revenue, Profit, Orders, Margin
- Interactive Revenue vs Profit area chart
- Top products with margin progress bars
- Smart alerts auto-generated from your data

### 🧠 AI Insights Panel
- 6 auto-generated business intelligence insights
- Month-over-month analysis table
- Specific findings like *"Revenue dropped 12% in Feb due to low orders"*

### 🤖 AI Business Analyst (Claude API)
- Full chat interface powered by Claude AI
- Quick suggestion buttons
- Ask anything — *"Why did profit drop?"*, *"Predict next month revenue"*
- Context-aware responses using your actual business data

### 🔮 Revenue Forecast
- ML-powered 6-month revenue projection
- Visual trend chart with actual vs forecast
- Written AI forecast summary

### 🚨 Smart Alerts
- Auto-detects margin below threshold
- Revenue drop warnings
- Growth signals
- WhatsApp and Email alert actions

### 📱 WhatsApp Automation
- Send instant business alerts to your phone
- Configurable margin threshold
- One-click WhatsApp deep link with full report

### 🛍️ Product Analytics
- Revenue and margin breakdown per product
- Ranked with progress bars
- Units sold tracking

### 👥 Multi-Tenant Client Management
- Role-based access (Admin / Client)
- Switch between multiple company workspaces
- Per-client data isolation

### 📋 Activity Feed
- Live business event history
- System notifications

### ⚙️ Settings
- Workspace switcher (5 tenants)
- Profile management
- Email report scheduling
- CSV export

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/kiru-builds/profitpulse.git

# Navigate into project
cd profitpulse

# Install dependencies
npm install

# Install recharts
npm install recharts
```

### Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_KEY=sk-ant-your-claude-api-key-here
```

Or directly in `src/App.js` line 5:
```js
const API_KEY = "sk-ant-your-key-here";
```

### Run locally

```bash
npm start
```

Opens at `http://localhost:3000`

---

## 🔐 Demo Accounts

| Account | Email | Password | Role |
|---------|-------|----------|------|
| ⚡ Admin | admin@profitpulse.com | admin123 | Full Access |
| 🖥️ TechStore | ravi@techstore.com | tech123 | Client |
| 👗 FashionHub | priya@fashionhub.com | fashion123 | Client |

Each account has unique business data, products, and analytics.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend framework |
| Recharts | Charts and data visualization |
| Claude API (claude-sonnet-4-6) | AI insights and chat |
| Vercel | Deployment and hosting |
| CSS-in-JS | Styling |

---

## 📁 Project Structure

```
profitpulse/
├── public/
│   └── index.html
├── src/
│   ├── App.js          ← Main dashboard (all features)
│   ├── index.js
│   └── index.css
├── .env                ← API key (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🌐 Deployment

### Deploy on Vercel (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for auto-deploy on every push.

**Add environment variable in Vercel:**
- Dashboard → Project → Settings → Environment Variables
- Add `REACT_APP_API_KEY` = your Claude API key

---

## 💰 Use Cases

This dashboard is built for:
- **Small e-commerce businesses** — understand their data without a data team
- **D2C brands** — track product performance and margins
- **Freelance clients** — sell as a white-label analytics solution
- **Startups** — monitor growth metrics in real time

**Selling price: ₹5,000 – ₹30,000 per client**

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT License — free to use and modify.

---

## 👨‍💻 Built By

**Kiru** — AI & Data Science Student
GitHub: [@kiru-builds](https://github.com/kiru-builds)
Stack: React · Claude API · Recharts · Vercel

---

> ⭐ If this project helped you, give it a star on GitHub!
## 👩‍💻 Author

<div align="center">

### *Kirthika Rajendran*
#### AI Tools Developer | React | Python | Claude AI

[

![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

](https://github.com/kiru-builds)
[

![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)

](https://www.linkedin.com/in/kirthika-rajendran-0303383b4)
[

![Portfolio](https://img.shields.io/badge/Portfolio-D4A843?style=for-the-badge&logo=vercel&logoColor=white)

](https://kiru-builds.github.io/)

</div>

---
