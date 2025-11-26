export interface CallSummary {
  summary: string
}

export async function summarizeCall(transcript: string): Promise<CallSummary> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey || transcript.length === 0) {
    // Fallback: use first 500 chars as summary
    return {
      summary: transcript.slice(0, 500) + (transcript.length > 500 ? "..." : ""),
    }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert assistant that creates concise call summaries for travel agents.

Your goal: Help the agent quickly understand what the client wants so they can call them back prepared.

FOCUS ON:
- Travel destination(s) the client is interested in
- Departure city/location if mentioned
- Travel dates or timeframe
- Number of travelers and their relationship (family, couple, solo, etc.)
- Budget range if discussed
- Specific requests or preferences (hotel type, activities, etc.)
- Any urgency or timeline for booking

NEVER INCLUDE:
- Administrative details (phone numbers, email collection, name confirmation)
- Small talk or greetings
- Repetitive information
- The fact that information was "collected" or "confirmed"

FORMAT:
Write 2-3 clear, direct sentences. Start with the most important information (destination and purpose).
Always use "the client" (never "the user" or "they").

EXAMPLE GOOD SUMMARY:
"The client is interested in a family trip to Dubai for 4 people in December. They're departing from Montreal and looking for luxury hotels with activities for children. Budget is around $8,000-10,000."

EXAMPLE BAD SUMMARY:
"The user provided their phone number as 514-XXX-XXXX and name as John. The assistant confirmed the details and asked for an email address. The user mentioned interest in travel."`,
          },
          {
            role: "user",
            content: `Summarize this call transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
        response_format: { type: "text" },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    // Clean up the summary
    let summary = content.trim()
    
    // Remove any JSON formatting if present
    const jsonMatch = summary.match(/\{[\s\S]*"summary"[\s\S]*:[\s\S]*"([^"]+)"[\s\S]*\}/)
    if (jsonMatch) {
      summary = jsonMatch[1]
    }
    
    // Remove markdown code blocks if present
    summary = summary.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    // Remove quotes if the entire response is quoted
    if (summary.startsWith('"') && summary.endsWith('"')) {
      summary = summary.slice(1, -1)
    }

    return {
      summary: summary || transcript.slice(0, 500),
    }
  } catch (error) {
    console.error("Error summarizing call with OpenAI:", error)
    // Fallback to simple truncation
    return {
      summary: transcript.slice(0, 500) + (transcript.length > 500 ? "..." : ""),
    }
  }
}

