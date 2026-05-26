import { IssueCategory, Urgency } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface AnalysisResult {
  category: IssueCategory;
  urgency: Urgency;
  title: string;
  summary: string;
}

export const analyzeIssueReport = async (description: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_URL}/ai/analyze-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
        console.warn(`Backend Analysis Failed: ${response.status}`);
        throw new Error("Backend Error");
    }

    const data = await response.json();
    return {
        category: data.category as IssueCategory,
        urgency: data.urgency as Urgency,
        title: data.title,
        summary: data.summary
    };

  } catch (error) {
    console.error("Gemini Service Error (Frontend):", error);
    // Fallback mock response so UI continues to function
    return {
      category: IssueCategory.OTHER,
      urgency: Urgency.MEDIUM,
      title: "New Issue Report",
      summary: description.substring(0, 100) + "..."
    };
  }
};

export const generateAdminInsights = async (issues: any[]) => {
    try {
        // Send a lightweight payload
        const simplifiedIssues = issues.slice(0, 20).map((i: any) => ({
            category: i.category,
            urgency: i.urgency,
            title: i.title
        }));

        const response = await fetch(`${API_URL}/ai/admin-insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ issues: simplifiedIssues }),
        });

        if (!response.ok) return "AI insights unavailable (Backend Error).";
        
        const data = await response.json();
        return data.insight || "No insights generated.";
    } catch (e) {
        console.error("Insight Generation Error:", e);
        return "Could not generate insights.";
    }
}
