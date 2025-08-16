// Utility function to send messages to the n8n webhook
interface SendMessageParams {
  chatId: string;
  content: string;
  userId: string;
}

interface SendMessageResponse {
  // Define the response structure based on what the webhook returns
  [key: string]: any;
}

export async function sendMessage({ chatId, content, userId }: SendMessageParams): Promise<SendMessageResponse> {
  try {
    const response = await fetch(
      'https://chatbotapplication.app.n8n.cloud/webhook/webhook/hasura-sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: { name: 'sendMessage' },
          input: {
            chat_id: chatId,
            message_id: Date.now().toString(),
            content,
          },
          session_variables: {
            'x-hasura-user-id': userId,
            'x-hasura-role': 'user',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to call n8n webhook');
  }
}
