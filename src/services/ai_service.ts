import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI CV Generator",
  }
});

const MODEL_ID = "stepfun/step-3.5-flash:free";

export const generateOptimizedResume = async (baseResume: string, jobDescription: string) => {
  const prompt = `
    You are an expert career coach and ATS (Applicant Tracking System) specialist.
    I will provide you with a Base CV and a Job Description. 
    Your task is to rewrite the CV to be highly optimized for the given job description while maintaining the truth of the candidate's experience.
    
    BASE CV:
    ${baseResume}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    INSTRUCTIONS:
    - Use relevant keywords from the job description.
    - Highlight experiences that match the requirements.
    - Keep a professional, modern tone.
    - Output ONLY the optimized CV content. do not add any preamble or conversational text.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error("OpenRouter Resume Error:", err);
    throw err;
  }
};

export const generateCoverLetter = async (baseResume: string, jobDescription: string) => {
  const prompt = `
    You are an expert career coach.
    Based on the following Base CV and Job Description, write a professional and compelling Cover Letter.
    
    BASE CV:
    ${baseResume}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    INSTRUCTIONS:
    - Address the key requirements of the job.
    - Show enthusiasm and culture fit.
    - Keep it concise (max 400 words).
    - Output ONLY the cover letter content. do not add any preamble or conversational text.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error("OpenRouter Cover Letter Error:", err);
    throw err;
  }
};

export const generateInterviewQuestions = async (baseResume: string, jobDescription: string) => {
  const prompt = `
    You are an expert Hiring Manager and Interviewer.
    Based on the following Base CV and Job Description, generate a list of 5-8 potential interview questions (both behavioral and technical).
    For each question, provide a brief 'Why this was asked' and a 'Sample/Key points for response'.

    BASE CV:
    ${baseResume}

    JOB DESCRIPTION:
    ${jobDescription}

    INSTRUCTIONS:
    - Target specific skills mentioned in the job description.
    - Identify potential gaps in the candidate's CV and ask about them.
    - Provide the output in a clean, readable format.
    - Output ONLY the questions and responses. do not add any preamble or conversational text.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error("OpenRouter Interview Error:", err);
    throw err;
  }
};

export const extractResumeFromLinkedIn = async (htmlContent: string) => {
  const prompt = `
    You are an expert data extractor. I have a raw HTML or text from a LinkedIn public profile.
    Extract the following information and format it into a professional, clean Markdown resume:
    - NAME
    - SUMMARY / ABOUT
    - EXPERIENCE (Company, Title, Dates, and any bullet points)
    - EDUCATION
    - SKILLS
    
    If you cannot find some fields, just omit them. Ensure the output is JUST the Markdown resume, no conversational text.
    
    LINKEDIN CONTENT:
    ${htmlContent.substring(0, 50000)} 
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content || "Gagal mengekstrak data LinkedIn.";
  } catch (err: any) {
    console.error("OpenRouter LinkedIn Extraction Error:", err);
    throw err;
  }
};

export const generateStructuredResume = async (markdownContent: string) => {
  const prompt = `
    You are an expert data parser. I will provide you with a Markdown resume content.
    Convert this into a valid JSON object matching this structure:
    {
      "name": "string",
      "role": "string",
      "summary": "string",
      "skills": ["string", "string"],
      "experience": [
        {
          "title": "string",
          "company": "string",
          "period": "string",
          "description": ["bullet1", "bullet2"]
        }
      ]
    }
    
    CONTENT:
    ${markdownContent}
    
    INSTRUCTIONS:
    - Respond ONLY with valid JSON.
    - If you can't find a role, extrapolate a professional one from the experience.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (err: any) {
    console.error("Structured Parsing Error:", err);
    return null;
  }
};
