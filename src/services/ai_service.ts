import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-your-key-here",
});

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
    - Output only the optimized CV content in a clear format.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || null;
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
    - Output only the cover letter content.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || null;
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
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || null;
};
