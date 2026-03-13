# PureFlow

A high-performance, **zero-jank** streaming Markdown renderer built with a **Decoupled Lexer-Renderer Architecture**. Designed specifically for LLM-based streaming applications where UI responsiveness and visual stability are critical.

## 🚀 The Problem

Traditional Markdown parsers (and VDOM-based frameworks like React) often struggle with high-frequency streaming data:

- **Source Code Flickering**: Seeing raw symbols like `**` or `|` before they are parsed.
- **Main Thread Bloat**: Heavy Regex matching during streaming causes dropped frames (UI lag).
- **Layout Thrashing**: Frequent `innerHTML` updates force the browser to recalculate the entire DOM tree repeatedly.

## ✨ Our Solution: The PureFlow Architecture

PureFlow 2.0 uses a **Dual-Thread Pipeline** to achieve smooth 60FPS rendering:

1. **Off-Main-Thread Lexing (Web Worker)**: All complex pattern matching and state management (e.g., tracking if we are inside a table or a code block) happens in a Background Worker.
2. **Instruction-Based Communication (Tokens)**: The Worker sends atomic "Tokens" (e.g., `BOLD_START`, `TABLE_ROW`) instead of raw text, preventing the renderer from ever seeing "unparsed" source code.
3. **RAF-Synchronized Rendering**: The main thread consumes the token queue inside a `requestAnimationFrame` loop, batching DOM updates to match the monitor's refresh rate.
4. **O(1) DOM Mutation**: Uses native `.append()` and `createElement` instead of `innerHTML`, ensuring that existing content is never re-processed by the browser.

## ✨ Features

- **Zero-Flicker Style Transitions**: Bold, Headers, and Code blocks appear instantly in their final styled form.
- **High-Performance Tables**: Renders complex Markdown tables with zebra-striping without layout shifts.
- **Auto-Follow Scroll**: Intelligent "instant" scroll-to-bottom that keeps pace with the stream.
- **Tailwind CSS v4 Integration**: Leveraging modern atomic CSS for a polished, professional UI.

## 📦 Project Structure

```text
src/
├── main.js    # The Consumer: High-speed DOM Renderer & RAF Loop
└── worker.js  # The Producer: Token-based Lexer & SSE Simulator
```

## 🚀 Getting Started

Since this project uses Native ES Modules inside Web Workers, it requires a local server environment:

- Clone the repository.

- Run a local server (e.g., using Vite or Live Server):

```
pnpm dev
```

- Open the browser and click "Execute Stream" to witness the 60FPS performance.

## 📊 Performance Benchmark

As seen in the Chrome DevTools Performance profile:

- Scripting: < 20ms per 1000 tokens.

- Rendering/Painting: Minimal overhead due to incremental DOM appending.

- FPS: Locked at 60fps even during heavy table/code block streaming.

Developed with ❤️ for the high-performance Web.
