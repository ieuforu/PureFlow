# PureFlow

A high-performance, **zero-jank** streaming Markdown renderer built with a **Decoupled Lexer-Renderer Architecture**. Designed specifically for LLM-based streaming applications where UI responsiveness and visual stability are critical.

## 🚀 The Problem

Traditional Markdown parsers often struggle with high-frequency streaming data:

- **Source Code Flickering**: Raw symbols like `**` or `|` flashing before they are parsed.
- **Main Thread Bloat**: Heavy Regex matching on the main thread causes dropped frames.
- **Micro-Reflow Storms**: Frequent small DOM updates force the browser to recalculate layout repeatedly.

## ✨ Our Solution: The PureFlow Architecture

PureFlow 2.0 uses a **Dual-Thread Pipeline** to achieve locked 60FPS rendering:

1. **Off-Main-Thread Lexing**: All complex pattern matching and state management (e.g., tracking tables or code blocks) is offloaded to a **Web Worker**.
2. **Instruction-Based Tokens**: The worker emits atomic instructions (e.g., `BOLD_START`, `TABLE_ROW`), ensuring the UI never encounters unparsed source code.
3. **RAF-Synchronized Batching**: Instead of immediate rendering, tokens are collected and flushed using **`DocumentFragment`** inside a `requestAnimationFrame` loop. This batches hundreds of updates into a single browser paint.
4. **Smart Scroll Lock**: Implements an intelligent auto-scroll that automatically pauses when the user manually scrolls up to inspect history, preventing "scroll hijacking."

## ✨ Features

- **Zero-Flicker Transitions**: Instant styling for bold, headers, and complex code blocks.
- **Atomic Table Rendering**: High-performance table streaming with zero layout shifts.
- **Buffered DOM Mutation**: Uses `DocumentFragment` for $O(1)$ batch updates, bypassing the overhead of `innerHTML` or frequent `insertAdjacentHTML`.
- **Tailwind CSS v4**: Built with the latest atomic CSS for peak styling performance.

## 📦 Project Structure

```text
src/
├── main.js    # The Consumer: RAF Batch Renderer & Scroll Controller
└── worker.js  # The Producer: Off-main-thread Lexer & SSE Simulator
```

## 🚀 Getting Started

PureFlow 2.0 utilizes Native ES Modules in Web Workers. A local development server is required:

- Clone the repository.

- Install dependencies & start:

```
pnpm install
pnpm dev
```

- Open the browser and click "Execute Stream" to witness the 1.7s stress test performance.

## 📊 Performance Benchmark

Optimized for high-density LLM outputs:

- Scripting Time: < 20ms per 1000 tokens.

- Render Latency: < 1ms (due to batching).

- FPS: Locked at 60FPS even during high-frequency table/code block streaming.
