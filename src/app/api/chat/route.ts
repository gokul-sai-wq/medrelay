import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // SMART MOCK BACKEND
    // In a real scenario, this would call Gemini API or OpenAI API
    // We simulate a smart LLM by parsing keywords
    
    let riskLevel = "low";
    let replyText = "Based on your symptoms, monitor your condition closely. If it worsens, please consult a doctor.";
    
    const lowerInput = message.toLowerCase();
    
    // Critical Cases
    if (lowerInput.includes("chest pain") || lowerInput.includes("unconscious") || lowerInput.includes("breathing") || lowerInput.includes("stroke")) {
      riskLevel = "critical";
      replyText = "URGENT: These symptoms indicate a potential medical emergency. I am generating an immediate referral to Indira Gandhi Govt General Hospital, Pondicherry. Please dispatch an ambulance immediately.";
    } 
    // High Risk
    else if ((lowerInput.includes("fever") && lowerInput.includes("days")) || lowerInput.includes("bleeding") || lowerInput.includes("pregnant")) {
      riskLevel = "high";
      replyText = "This is a high-risk scenario. Please initiate a teleconsultation with a specialist immediately or book an urgent PHC visit.";
    }
    // Moderate Risk
    else if (lowerInput.includes("fever") || lowerInput.includes("cough") || lowerInput.includes("pain") || lowerInput.includes("vomit")) {
      riskLevel = "moderate";
      replyText = "These symptoms require medical attention. Prolonged fever could indicate an infection like Dengue or Malaria in your area. Please visit the nearest Primary Health Centre (PHC) for a test.";
    }
    
    // Simulate network delay to make it feel like a real LLM processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({
      replyText,
      riskLevel
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
