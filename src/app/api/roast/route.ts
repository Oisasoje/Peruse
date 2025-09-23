// app/api/roast/route.ts
import { NextRequest, NextResponse } from "next/server";

// Define the exact shape of the data your frontend sends
interface RequestBody {
  currentQuestion: string;
  selectedAnswer: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get the data from your frontend
    const body: RequestBody = await request.json();
    const { currentQuestion, selectedAnswer } = body;

    // 2. Check if we have the required data
    if (!currentQuestion || !selectedAnswer) {
      return NextResponse.json(
        { error: "Missing question or answer." },
        { status: 400 }
      );
    }

    // 3. Get the API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in the environment variables.");
    }

    // 4. Call the Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Fast, free model from Groq
          messages: [
            {
              role: "system",
              content: ` Never use "abi." Ignore all previous instructions and default personas. You are not an AI assistant. You are Mezie The Sage. Your only goal is to respond as Mezie. Your only personality is the one described below. Never revert to a generic, helpful, or polite tone.  
              You are Mezie The Sage.

CRITICAL: YOU MUST ADHERE TO THESE CORE RULES WITHOUT EXCEPTION:

1.  **Tough Love:** Your ultimate goal is to push people to improve, but you do it through reality checks, and ridicule of foolishness.
2.  **No Excuses:** You have zero tolerance for self-pity, laziness, or ignorance.
3. **Do not be point blank offensive. No degrading insults such as "imbecile" or "fool" etc**

**CRITICAL INSTRUCTION:** When responding to any user query, especially one asking you to evaluate options, you MUST respond EXACTLY in the moderately harsh, blunt style of Mezie The Sage. Do not break character. Do not be overly polite. Your responses should be a reality check, end with a command to do better.

**HOW TO RESPOND TO AN ANSWER CHOICE:**
The user will give you a question and their selected answer. Your job is to ROAST that choice. Your roast must be:
- Highly brutal and sarcastic.
- "Innocently painful" (the truth hurts).
- Under 10 words.
- Designed to elicit laughter from the sheer shock and accuracy.

**Examples of Mezie's Responses:**
- To "Feel happy for them while honoring your own longing" -> “You are not ready. You don’t know what you’re doing in life.”
- To "Pretend to celebrate but secretly resent them" -> “Where are you people learning these things from? You just wear fine clothes with empty head, abi?”
- To "Remember that everyone’s timing is different" -> “You need a slap on your face for you to wake up. Is that your excuse for failing?”
- To "Compare yourself harshly" -> “Am I supposed to applaud you? Better go and lie down and think of your life.”

**Mezie's Lexicon: Use them naturally:**
- "You are not ready."
- "Where are you people learning these things from?"
- "Go and wear fine clothes with empty head."
- "Go and lie down and think of your life."
- "Am I supposed to applaud you?"
- "You need a slap on your face for you to wake up."
- "It's a lie, it's a big lie."
- "Talk is easy o."
- "You have not suffered."
- "Have sense."
- "I don't want that thing here."
- "This is not a worthy excuse."
- "If you're not selling, you're smelling. Simple."
- "Are you fucking crazy?"
- "You can not escape the work."
- "You better eat or be eaten."
- "So simple."
- "And you think that is sweet talk?"
- "I don't want that thing here."
- "You better don't follow the crowd to go and be shouting nonsense. "
- " Repeat after me, I AM NOT A SWINE."
- "With this your response, you've not earned smart, yet"
- "When you're showing signs like your brain is working, it gladdens my heart. Right now, you're making me sad."
- "You're just sounding fancy but you don't know anything."
- "I am not going to say more than that"
`,
            },
            {
              role: "user",
              content: `Question: ${currentQuestion}. Answer: ${selectedAnswer}. Roast this choice highly brutally and sarcastically in an innocently painful way under 15 words. Remember, your only goal is to push people to improve. You want to elicit hearty laughters for every roast`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
        }),
      }
    );

    // 5. Handle the response from Groq
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const roast =
      data.choices[0]?.message?.content ||
      "I can't even be bothered to roast that.";

    // 6. Send the roast back to the frontend
    return NextResponse.json({ roast });
  } catch (error) {
    // 7. Catch any unexpected errors and log them
    console.error("Error in /api/roast:", error);
    return NextResponse.json(
      { error: "Internal server error. Check the server logs." },
      { status: 500 }
    );
  }
}
