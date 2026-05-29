# Civic Radar TN 🏛️

**Government services, simplified.** 

Civic Radar is a comprehensive digital platform designed for the state of Tamil Nadu. It bridges the gap between citizens and the government by providing a unified portal to access government schemes, check eligibility, report civic issues, and track progress — all in one place.

![Bilingual Support](https://img.shields.io/badge/Language-English%20%7C%20Tamil-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## ✨ Features

### For Citizens 👥
*   **Bilingual Interface:** Seamlessly switch between English and Tamil (தமிழ்) for maximum accessibility.
*   **Government Schemes:** Explore available government benefits and schemes (e.g., Midday Meals, PDS, Scholarships).
*   **Eligibility Checker:** Answer a few simple questions to instantly find out which schemes you qualify for.
*   **Civic Issue Reporting:** Easily report local problems (like water shortages, uncollected garbage, broken roads) and track their resolution status.
*   **Secure Authentication:** Quick and secure sign-in using Google OAuth.

### For Administrators 🛡️
*(Requires an authorized `@veltech.edu.in` email account)*
*   **Admin Dashboard:** A centralized overview of all reported civic issues.
*   **NLP Insights:** AI-powered Natural Language Processing automatically categorizes issues, determines urgency, and extracts key trends from citizen reports.
*   **Trend Analysis & Tracking:** Monitor resolution times, view issue distributions, and track overall civic health scores across regions.

---

## 🛠️ Technology Stack

**Frontend:**
*   [Next.js 14](https://nextjs.org/) (App Router)
*   [React 18](https://reactjs.org/)
*   [Tailwind CSS](https://tailwindcss.com/) for styling
*   [Zustand](https://zustand-demo.pmnd.rs/) for state management
*   [Lucide React](https://lucide.dev/) for iconography
*   [Recharts](https://recharts.org/) for data visualization

**Backend:**
*   [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   Google OAuth 2.0 validation
*   AI/NLP processing pipelines

**Deployment:**
*   Hosted on [Vercel](https://vercel.com/) (Both Next.js frontend and FastAPI serverless functions)

---

## 🚀 Getting Started

Follow these steps to run Civic Radar locally on your machine.

### Prerequisites
*   Node.js (v18 or higher)
*   Python 3.9+
*   A Google Cloud Console project with OAuth 2.0 Client ID configured.

### 1. Clone the repository
```bash
git clone https://github.com/Im-manojkumar/civic-radar.git
cd civic-radar
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory based on the provided `.env.example`:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### 3. Frontend Setup
Install the necessary Node dependencies:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
The frontend will be running at `http://localhost:3000`.

### 4. Backend Setup
Navigate to the backend directory and set up your Python environment:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Run the FastAPI development server:
```bash
uvicorn api.index:app --reload --port 8000
```
The backend API will be running at `http://localhost:8000`.

*(Note: In production on Vercel, API routes are automatically proxied to the Python backend via `next.config.mjs` and `vercel.json` rewrites).*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/Im-manojkumar/civic-radar/issues) if you want to contribute.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
