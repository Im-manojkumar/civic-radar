# 🏛️ Civic Radar TN

> **Government services, simplified.** A unified platform for citizens of Tamil Nadu to access government schemes, check eligibility, report civic issues, and track resolutions with complete transparency.

![Civic Radar Banner](https://via.placeholder.com/1200x400/0f172a/38bdf8?text=Civic+Radar+Tamil+Nadu)

---

## 🌟 Vision
Civic Radar TN bridges the gap between citizens and the government. It acts as a **smart civic companion** for citizens and a **command center** for administrators. Powered by real-time analytics, AI insights, and an intuitive bilingual interface (English/Tamil), the platform ensures every voice is heard and every issue is resolved efficiently.

---

## 🚀 Key Features

### For Citizens 👥
*   **🌐 Bilingual Support:** Fully localized in English and Tamil.
*   **🌙 Adaptive UI:** Seamless Dark & Light modes for comfortable viewing.
*   **📝 Smart Grievance Reporting:** Report issues with photos and precise location data.
*   **📈 Real-time Issue Tracking:** Monitor the lifecycle of reported issues (Open -> In Progress -> Resolved) with a detailed timeline.
*   **👍 Community Upvoting:** Upvote existing issues to increase priority without duplicating reports.
*   **🌟 Karma & Gamification:** Earn "Karma Points" for active civic participation and helpful reports.
*   **🔍 Scheme Discovery:** Explore government schemes, read eligibility criteria, and find out how to apply.

### For Administrators 🛡️
*   **📊 Unified CRM Command Center:** Manage all civic issues from a single, powerful dashboard.
*   **🗺️ Geospatial Intelligence:** Identify high-priority zones using scatter charts and heatmap representations.
*   **🧠 AI-Powered Insights (NLP):** Auto-categorize issues, detect sentiment, and summarize large volumes of feedback.
*   **⚡ Automated Alerting:** Trigger baseline deviations and notify relevant officials automatically.
*   **👥 Officer Assignment:** Assign specific officers and zones to issues directly from the dashboard.

### For the Public 🌍
*   **📊 Transparency Dashboard:** Open access to real-time resolution metrics and government performance statistics.

---

## 🛠️ Tech Stack

**Frontend:**
*   **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **UI Components:** Custom minimal components built with Radix-like API patterns.

**Backend:**
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Database:** PostgreSQL (via [SQLAlchemy](https://www.sqlalchemy.org/))
*   **Authentication:** JWT (JSON Web Tokens)
*   **AI Integration:** Gemini API for NLP and text analysis (fallback supported)
*   **Deployment:** Vercel (Serverless Python & Next.js)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/civic-radar.git
cd civic-radar
```

### 2. Set Up the Backend
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL database URL and other secrets

# Run database migrations (or seed)
python scripts/seed.py

# Create an admin user
python scripts/create_admin.py admin@veltech.edu.in admin123 Admin
```

### 3. Set Up the Frontend
```bash
# Install Node dependencies
npm install

# Start the development server
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000). The FastAPI backend routes automatically via Next.js proxying in development or Vercel serverless in production.

---

## 📂 Project Structure

```
civic-radar/
├── app/                  # Next.js App Router (Citizen, Admin, Transparency pages)
├── backend/              # FastAPI Python Backend
│   ├── routers/          # API Endpoints (issues, analytics, ai, auth, etc.)
│   ├── schemas/          # Pydantic validation models
│   ├── services/         # Business logic & LLM integrations
│   └── models.py         # SQLAlchemy Database Models
├── components/           # Reusable React UI Components
├── config/               # Localization (EN/TA) and UI constants
├── lib/                  # Frontend utilities, Axios instances, Zustand stores
├── scripts/              # Database seeding and utility scripts
├── requirements.txt      # Python dependencies
└── package.json          # Node dependencies
```

---

## 🤝 Contributing
Contributions are always welcome! Whether it's reporting a bug, proposing a new feature, or submitting a pull request, your help makes Civic Radar better.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <i>Built with ❤️ for a better Tamil Nadu.</i>
</div>
