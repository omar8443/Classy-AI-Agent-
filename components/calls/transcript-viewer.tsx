"use client"

import { Phone, User } from "lucide-react"

interface Message {
  role: "agent" | "user"
  text: string
}

interface TranscriptViewerProps {
  transcript: string
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  // Parse transcript into messages
  const parseTranscript = (text: string): Message[] => {
    const lines = text.split("\n")
    const messages: Message[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Check if line starts with "Agent:" or "User:"
      if (trimmed.startsWith("Agent:")) {
        messages.push({
          role: "agent",
          text: trimmed.replace(/^Agent:\s*/i, "").trim(),
        })
      } else if (trimmed.startsWith("User:")) {
        messages.push({
          role: "user",
          text: trimmed.replace(/^User:\s*/i, "").trim(),
        })
      } else if (messages.length > 0) {
        // Continue previous message
        messages[messages.length - 1].text += " " + trimmed
      } else {
        // Default to user if no prefix
        messages.push({
          role: "user",
          text: trimmed,
        })
      }
    }

    return messages
  }

  const messages = parseTranscript(transcript)

  if (messages.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No transcript available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-h-[600px] overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-3 ${message.role === "agent" ? "justify-start" : "justify-end"}`}
        >
          {message.role === "agent" && (
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
          
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              message.role === "agent"
                ? "bg-primary/10 text-foreground rounded-tl-sm"
                : "bg-blue-500 text-white rounded-tr-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

