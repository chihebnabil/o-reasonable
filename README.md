# O-Reasonable 🧠

A lightweight reasoning agent designed to mimic logical planning and problem-solving capabilities using cost-effective OpenAI models. It generates step-by-step plans, executes them sequentially, and synthesizes a final answer.

[![demo](./demo.gif)]

## Features

- 🎯 Dynamic model selection with sensible defaults
- 📋 Structured step-by-step planning
- 🔄 Sequential execution of reasoning steps
- 🎨 Clean and informative console output
- ⚡ Built with TypeScript and Vite

## Installation

```bash
npm install o-reasonable
```

## Configuration

You'll need to set up your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or create a `.env` file in your project root:

```env
OPENAI_API_KEY=your-api-key-here
```

## Usage

```typescript
import { runAgent } from 'o-reasonable';

// Basic usage with default model (logs enabled by default)
const result = await runAgent("What would be the impact of implementing a four-day work week?");

// Using a custom model with logs disabled
const result = await runAgent("Analyze the pros and cons of remote work", {
  model: "gpt-4o-mini",
  enableLogs: false
});

// The result contains steps and final answer
console.log(result.steps);         // Array of step results
console.log(result.finalQuestion); // The final question asked
console.log(result.finalAnswer);   // The final synthesized answer
```

## Configuration Options

The `runAgent` function accepts a configuration object with the following options:

```typescript
interface OReasonableConfig {
  model?: string;     // OpenAI model to use (default: "gpt-4o-mini")
  apiKey?: string;    // Optional API key override
  enableLogs?: boolean; // Enable/disable console logs (default: false)
}
```

## Return Type

The `runAgent` function returns a promise that resolves to an `AgentResult`:

```typescript
interface AgentResult {
  steps: string[];      // Results from each reasoning step
  finalQuestion: string; // The final question that was asked
  finalAnswer: string;  // The synthesized final answer
}
```

## Development

To set up the development environment:

```bash
git clone https://github.com/chihebnabil/o-reasonable.git
cd o-reasonable
npm install
npm run dev
```

## Building

```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Created with ❤️ by Chiheb Nabil