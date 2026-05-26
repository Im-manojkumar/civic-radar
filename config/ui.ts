export const uiConfig = {
    theme: {
        name: "Tamil Nadu Civic Theme",
        colors: {
            primary: "tn-600",
            secondary: "tn-gold",
            background: "slate-50"
        },
        fontFamily: "Inter", 
        logoText: "Civic Radar TN",
        logoSubText: "Govt of Tamil Nadu"
    },
    features: {
        analytics: true,
        aiAssistant: true,
        citizenReporting: true,
        adminDashboard: true,
        datasets: true,
        alerts: true
    },
    defaultLanguage: "en" as const,
    supportedLanguages: ["en", "ta"] as const
};