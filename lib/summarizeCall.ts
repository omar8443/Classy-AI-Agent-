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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes phone calls. Provide a concise 2-3 sentence summary. Respond in JSON format: {\"summary\": \"...\"}",
          },
          {
            role: "user",
            content: `Summarize this phone call transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || transcript.slice(0, 500),
      }
    }

    // Fallback if JSON parsing fails
    return {
      summary: content.slice(0, 500),
    }
  } catch (error) {
    console.error("Error summarizing call with OpenAI:", error)
    // Fallback to simple truncation
    return {
      summary: transcript.slice(0, 500) + (transcript.length > 500 ? "..." : ""),
    }
  }
}

