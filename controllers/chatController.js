
import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL:
    "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const panelInstructions = {
  user: `You are CareerHub's User Assistant.
Help users with resume creation, resume templates, skills,
job searching, applications, and application tracking.
Give simple, friendly, practical answers.`,

  recruiter: `You are CareerHub's Recruiter Assistant.
Help recruiters with job postings, candidate search,
recruitment guidance, and hiring-related questions.
Give clear and professional answers.`,

  admin: `You are CareerHub's Admin Assistant.
Help admins understand dashboard features, recruiter
management, platform navigation, and system FAQs.
Never claim to perform an admin action yourself.`,
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, panel } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "Please enter a message.",
      });
    }

    if (!panelInstructions[panel]) {
      return res.status(400).json({
        reply: "Invalid panel selected.",
      });
    }

    const completion = await ai.chat.completions.create({
      model: process.env.AI_MODEL || "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: panelInstructions[panel],
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    console.log("AI Reply:", reply);

    return res.status(200).json({
      reply: reply || "AI returned an empty response.",
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      reply:
        error.status === 401
          ? "Invalid Gemini API key. Please check your backend .env file."
          : error.status === 429
          ? "AI request limit reached. Please try again later."
          : "Chatbot is temporarily unavailable. Please try again.",
    });
  }
};
