import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, QuizQuestion, DifficultyLevel } from "../types";
import { DIFFICULTY_LABELS } from "../constants";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates a quiz based on the provided configuration.
 */
export const generateQuiz = async (config: QuizConfig): Promise<QuizQuestion[]> => {
  const modelId = 'gemini-3-flash-preview';

  const difficultyText = DIFFICULTY_LABELS[config.difficulty];
  
  const prompt = `
    Create a quiz about "${config.topic}".
    Difficulty Level: ${difficultyText}.
    Number of questions: ${config.questionCount}.
    Language: Japanese.
    
    The questions must be strictly relevant to the topic and difficulty.
    Provide 4 options for each question.
    Ensure strict JSON output.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question text" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "An array of 4 possible answers"
              },
              correctAnswerIndex: { 
                type: Type.INTEGER, 
                description: "The index (0-3) of the correct answer in the options array" 
              },
              explanation: { 
                type: Type.STRING, 
                description: "A brief explanation of why the answer is correct" 
              }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as QuizQuestion[];
      return data;
    }
    throw new Error("No data returned from Gemini");

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};

/**
 * Sends a chat message to Gemini for help during the quiz.
 */
export const sendChatMessage = async (
  message: string, 
  currentQuestion: QuizQuestion,
  chatHistory: { role: string, parts: { text: string }[] }[]
): Promise<string> => {
  
  const modelId = 'gemini-3-flash-preview';
  
  // Construct context about the current problem
  const systemInstruction = `
    You are a helpful quiz assistant. The user is currently trying to solve this question:
    "${currentQuestion.question}"
    Options: ${currentQuestion.options.join(', ')}.
    
    Do NOT give the direct answer (index ${currentQuestion.correctAnswerIndex}). 
    Instead, provide hints, clarify terms, or guide the user toward the correct thinking process.
    Be concise and encouraging. Speak in Japanese.
  `;

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: { systemInstruction },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error connecting to the AI assistant.";
  }
};
