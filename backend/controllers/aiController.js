import { processAiQuery } from '../services/aiAssistantService.js'

// POST /api/ai/chat
export async function chatWithAi(req, res) {
  try {
    const { query, confirmAction, actionData, source, history } = req.body
    const user = req.user // attached from authenticateToken middleware

    const result = await processAiQuery({ query, confirmAction, actionData, user, source, history })
    return res.json({
      success: true,
      text: result.text,
      navigateTo: result.navigateTo || null,
      requiresConfirmation: result.requiresConfirmation || false,
      pendingAction: result.pendingAction || null,
    })
  } catch (error) {
    console.error('[AI Chat Controller Error]', error)
    return res.status(500).json({
      success: false,
      text: 'Sorry, I encountered an error processing your query. Please try again.',
    })
  }
}
