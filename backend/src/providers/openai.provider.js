const OpenAI = require("openai");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function callChatModel(model, prompt) {

  if(model=="gemini-2.5-flash" || model=="gemini-2.5-flash-lite"){
    const response = await ai.models.generateContent({
    model: model, 
    contents: prompt,
  });

  return {
    output: response.text, 
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
  }

  else{
  const response = await openai.responses.create({
    model: model, 
    input: prompt, 
    reasoning: {
      effort: "none" 
    }
  });

  return {
    output: response.output, 
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  }; 
  }
}

module.exports = { callChatModel };