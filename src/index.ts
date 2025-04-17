import OpenAI from "openai/index.mjs";
import { z } from "zod";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const DEFAULT_MODEL = "gpt-4o-mini";

interface OReasonableConfig {
  model?: string;
  apiKey?: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define a simpler schema for steps - no substeps extraction
const StepsSchema = z.object({
  steps: z.array(z.string()),
  finalQuestion: z.string()
});

async function planSteps(task: string, config: OReasonableConfig = {}) {
  const model = config.model || DEFAULT_MODEL;

  const initial = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content: 
          "You are a planning agent. Create 3-5 high-level steps to solve this task. " +
          "Output ONLY valid JSON in this format: { steps: [\"step 1\", \"step 2\", ...], finalQuestion: \"question to get final answer\" }"
      },
      {
        role: "user",
        content: `Plan steps for this task: ${task}`
      }
    ],
    temperature: 0,
    store: true
  });

  try {
    const parsed = StepsSchema.safeParse(JSON.parse(initial.output_text || "{}"));
    
    if (!parsed.success) {
      console.error("❌ Invalid step structure", parsed.error);
      return { steps: [], finalQuestion: task, initialResponseId: initial.id };
    }
    
    return { 
      steps: parsed.data.steps, 
      finalQuestion: parsed.data.finalQuestion,
      initialResponseId: initial.id 
    };
  } catch (e) {
    console.error("❌ Error parsing response", e);
    return { steps: [], finalQuestion: task, initialResponseId: initial.id };
  }
}

async function executeStepsSequentially(steps: string[], finalQuestion: string, initialResponseId: string, config: OReasonableConfig = {}) {
  const model = config.model || DEFAULT_MODEL;
  let prevResponseId = initialResponseId;
  let context = "";

  console.log("📝 Executing Steps:");
  
  // Execute each step
  for (const [index, step] of steps.entries()) {
    console.log(`➡️ Step ${index + 1}: ${step}`);
    
    const response = await openai.responses.create({
      model,
      previous_response_id: prevResponseId,
      input: [
        {
          role: "user",
          content: `Execute this step: ${step}\n${context ? `Context so far: ${context}` : ""}`
        }
      ],
      store: true
    });

    const result = response.output_text?.trim() || "";
    console.log(`🧠 Result: ${result}\n`);

    // Update context and response ID for next step
    context += `Step ${index + 1} result: ${result}\n`;
    prevResponseId = response.id;
  }

  // Get final answer
  console.log("🏁 Getting final answer...");
  const finalResponse = await openai.responses.create({
    model,
    previous_response_id: prevResponseId,
    input: [
      {
        role: "system",
        content: "Provide a comprehensive final answer in normal text format (not JSON). Summarize the findings from all steps into a cohesive response."
      },
      {
        role: "user",
        content: `${finalQuestion}\n\nBased on all the previous steps, provide a comprehensive final answer.`
      }
    ],
    store: true
  });

  const finalAnswer = finalResponse.output_text?.trim() || "";
  console.log("\n📊 FINAL ANSWER:");
  console.log(finalAnswer);

  return finalAnswer;
}

async function runAgent(task: string, config: OReasonableConfig = {}) {
  console.log(`🧠 Task: ${task}`);
  console.log(`🤖 Using model: ${config.model || DEFAULT_MODEL}`);

  const { steps, finalQuestion, initialResponseId } = await planSteps(task, config);
  
  if (!steps.length) {
    console.log("⚠️ No steps were generated. Running direct query.");
    const directResponse = await openai.responses.create({
      model: config.model || DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: "Provide a comprehensive analysis of this task."
        },
        {
          role: "user",
          content: task
        }
      ]
    });
    
    console.log("📊 DIRECT ANSWER:");
    console.log(directResponse.output_text?.trim() || "");
    return;
  }

  console.log("📝 Planned Steps:");
  steps.forEach((step, i) => console.log(`- Step ${i + 1}: ${step}`));
  console.log(`- Final: ${finalQuestion}`);

  await executeStepsSequentially(steps, finalQuestion, initialResponseId, config);
}

// 🧪 Try it out
runAgent("What would be the environmental and economic impacts of converting all passenger vehicles to electric by 2035");

export { runAgent, type OReasonableConfig, DEFAULT_MODEL };