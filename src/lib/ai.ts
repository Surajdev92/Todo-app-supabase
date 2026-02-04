const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim() || ''
const openAiApiBase = import.meta.env.VITE_OPENAI_API_BASE?.trim() || 'https://api.openai.com/v1'

if (!openAiApiKey) {
  // We don't throw here to still allow the rest of the app to work without AI enabled.
  // The AI UI will detect the missing key and show a helpful message instead.
  // eslint-disable-next-line no-console
  console.warn(
    '[AI] Missing VITE_OPENAI_API_KEY environment variable. AI features will be disabled until this is set.'
  )
}

export interface AiTodoSuggestion {
  title: string
  reason?: string
}

interface GenerateTodosResponse {
  suggestions: AiTodoSuggestion[]
}

export async function generateTodosFromPrompt(
  prompt: string,
  existingTitles: string[]
): Promise<AiTodoSuggestion[]> {
  if (!openAiApiKey) {
    throw new Error(
      'AI is not configured. Please set VITE_OPENAI_API_KEY in your environment to enable AI features.'
    )
  }

  const systemPrompt = `
You are an assistant embedded in a todo app. 
The user will describe their day, goals, or things on their mind.
Turn this into a concise, focused list of concrete todo items.

Return strictly JSON in the following format:
{
  "suggestions": [
    { "title": "string", "reason": "short explanation of why this is useful" }
  ]
}

Guidelines:
- Prefer small, actionable steps over vague goals.
- Avoid duplicating todos that are already present:
  Existing todos: ${existingTitles.join(', ') || 'none'}.
- At most 8 suggestions.
`.trim()

  const response = await fetch(`${openAiApiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI request failed: ${response.status} ${response.statusText} – ${text}`)
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }

  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('AI response was empty.')
  }

  let parsed: GenerateTodosResponse
  try {
    parsed = JSON.parse(content) as GenerateTodosResponse
  } catch (error) {
    // If parsing fails, try to be resilient by extracting a JSON block
    try {
      const start = content.indexOf('{')
      const end = content.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        parsed = JSON.parse(content.slice(start, end + 1)) as GenerateTodosResponse
      } else {
        throw error
      }
    } catch {
      throw new Error('Failed to parse AI response. Please try again.')
    }
  }

  return parsed.suggestions ?? []
}

