// export const ANALYZE_GITHUB_TASK = (jsonData: string) => `
// Analyze the following GitHub data and return a structured evaluation.

// GitHub Data:
// ${jsonData}

// Return the result in the required format.
// `;



// export const TASKS = {
//   CODE_REVIEW: `Analyze the provided code snippet. Identify bugs, performance bottlenecks, and style issues. 
//   Provide a numbered list of improvements and then the refactored code.`,
  
//   EXPLAIN_CONCEPT: `Explain the following topic in detail. Use bullet points for key features 
//   and provide a "Real World Example" section at the end.`,
  
//   GENERATE_UNIT_TEST: `Write a comprehensive test suite for the following function using Jest. 
//   Include edge cases and mock all external dependencies.`,

//   GITHUB_REVIEW: "github_profile_review",
// };

// export type TaskType = keyof typeof TASKS;

export enum TaskType {
  CHAT = "general_chat",
  GITHUB_REVIEW = "github_profile_review",
}
