# Token Masq

A minimalist token decoder that transforms CL100K_BASE tokens (used by GPT-4 and ChatGPT) back to English text and vice versa.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm (recommended) or npm

### Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
pnpm build
```

## How to Use

1. Enter token numbers separated by spaces in the input field
2. Press Enter to decode
3. Watch the scramble animation as tokens transform to text
4. Click anywhere on the decoded text to reset and enter new tokens

Thanks to [@dqbd](https://github.com/dqbd) for the [tiktoken](https://github.com/dqbd/tiktoken) library.

## License

MIT Licence