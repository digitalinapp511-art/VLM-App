import 'dotenv/config';
import { connectDB } from './config/db.js';
import Student from './models/Student.js';
import McqTask from './models/McqTask.js';

async function test() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  console.log("Finding a test student...");
  const student = await Student.findOne({});
  if (!student) {
    console.error("No student found in DB to run test!");
    process.exit(1);
  }

  console.log(`Using student: ${student.fullName} (Class: ${student.class}, Subjects: ${student.subjects?.join(', ')}, Weak Subjects: ${student.weakSubjects?.join(', ')})`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("Deleting today's existing McqTask to force a fresh LLM generation...");
  const deleteResult = await McqTask.deleteMany({
    studentId: student._id,
    date: { $gte: today }
  });
  console.log(`Deleted ${deleteResult.deletedCount} existing MCQ tasks for today.`);

  console.log("Generating fresh MCQ using LLM...");
  
  const selectedClass = student.class || '10';
  const subjects = student.subjects?.length ? student.subjects : ['Math', 'Science', 'English'];
  const weakSubjects = student.weakSubjects?.length ? student.weakSubjects : [];
  
  let questions = [];

  const apiKey = process.env.AICREDITS_API_KEY || 'sk-live-a92f285a97499b113c4bb6ef0098e42ac4a0875f83afb0903512abb77491db96';
  const baseUrl = process.env.AICREDITS_BASE_URL || 'https://aicredits.in/v1';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an educational assistant that generates daily MCQ test tasks for students. Generate exactly 15 MCQ questions in JSON format. The response must be a valid JSON array containing exactly 15 objects with the following schema:
[
  {
    "subject": "string",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0/1/2/3 (index of correct option),
    "explanation": "string"
  }
]`
          },
          {
            role: 'user',
            content: `Generate exactly 15 multiple choice questions for a Class ${selectedClass} student.
The student takes the following subjects: ${subjects.join(', ')}.
The student's weak subjects are: ${weakSubjects.join(', ')}. Please weight the questions to focus more (approx 50-60%) on these weak subjects so they can practice and improve.
Return ONLY a valid JSON array, do not wrap in markdown or backticks.`
          }
        ],
        max_tokens: 2000
      })
    });

    if (response.ok) {
      const responseData = await response.json();
      const replyText = responseData.choices?.[0]?.message?.content || '';
      let cleaned = replyText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed.slice(0, 15);
      }
    } else {
      console.error("LLM Error response code:", response.status);
    }
  } catch (err) {
    console.error("Failed to generate MCQs using LLM:", err.message);
  }

  console.log(`Generated ${questions.length} questions.`);
  if (questions.length > 0) {
    console.log("\nSample Question 1:");
    console.log(JSON.stringify(questions[0], null, 2));
    
    console.log("\nSample Question 2:");
    console.log(JSON.stringify(questions[1], null, 2));

    // Save it to database
    const task = await McqTask.create({
      studentId: student._id,
      class: selectedClass,
      date: today,
      questions,
      timerSeconds: 1200,
    });
    console.log(`\nSuccessfully saved daily MCQ task with ID: ${task._id} to DB!`);
  } else {
    console.log("\nGeneration failed or returned 0 questions.");
  }

  process.exit(0);
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
