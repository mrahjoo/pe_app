const { ToolLoopAgent, createAgentUIStreamResponse, tool } = require('ai');
const { z } = require('zod');
const { google } = require('@ai-sdk/google');

const myAgent = new ToolLoopAgent({
  model: google('gemini-3.5-flash-lite'),
  tools: {
    weather: tool({
      description: 'Get weather',
      inputSchema: z.object({ location: z.string() }),
      execute: async () => ({ location: 'Paris', temperature: 20 })
    })
  }
});

async function test() {
  try {
    const response = await createAgentUIStreamResponse({
      agent: myAgent,
      uiMessages: [
        {
          id: '123',
          role: 'user',
          content: [{ type: 'image', image: 'data:image/jpeg;base64,abc' }]
        }
      ]
    });
    console.log("SUCCESS");
  } catch (e) {
    console.error("ERROR:");
    console.error(JSON.stringify(e, null, 2));
  }
}

test();
