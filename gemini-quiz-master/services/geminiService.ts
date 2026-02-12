import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizConfig, Question, Difficulty, ChatMessage } from "../types";
import { DIFFICULTY_LABELS } from "../constants";

// Helper to ensure API key exists
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return key;
};

export const generateQuiz = async (config: QuizConfig): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const difficultyLabel = DIFFICULTY_LABELS[config.difficulty];
  
  const prompt = `
    Create a quiz about "${config.topic}".
    Number of questions: ${config.count}.
    Difficulty level: ${difficultyLabel} (Level ${config.difficulty}/5).
    
    Ensure the questions specifically match the requested difficulty.
    For "Very Easy", use common sense knowledge.
    For "Very Hard", use obscure trivia or deep technical details.
    Language: Japanese.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 multiple choice options" 
            },
            correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING, description: "Brief explanation of the answer" },
          },
          required: ["text", "options", "correctIndex", "explanation"],
        },
      },
    },
    required: ["questions"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);
    return parsed.questions.map((q: any, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  messages: ChatMessage[],
  currentQuestion: Question | null,
  topic: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Construct context
  let systemInstruction = `You are a helpful quiz assistant for the topic: ${topic}.`;
  
  if (currentQuestion) {
    systemInstruction += `
      The user is currently solving this question:
      "${currentQuestion.text}"
      Options: ${currentQuestion.options.join(', ')}.
      
      If the user asks for a hint, give a subtle hint without revealing the direct answer.
      If they ask for knowledge, explain the concept.
      Keep responses concise and encouraging.
    `;
  } else {
    systemInstruction += "The user is currently reviewing results or setting up a quiz.";
  }

  // Convert history to format expected by API if using chat mode, 
  // but for simplicity in this stateless request wrapper, we'll just send the history as content for a single turn or manage chat object.
  // We will use a chat session for better context handling.

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction,
    },
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
  });

  const lastMsg = messages[messages.length - 1];
  const response = await chat.sendMessage({
    message: lastMsg.text
  });

  return response.text || "Sorry, I couldn't generate a response.";
};
