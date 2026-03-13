let state = {
  isBold: false,
  isCodeBlock: false,
  isInTable: false,
}

self.onmessage = (e) => {
  if (e.data.type === 'START_STREAM') {
    state = { isBold: false, isCodeBlock: false, isInTable: false }
    simulateSSE()
  }
}

async function simulateSSE() {
  const text = `# 🚀 PureFlow 2.0 深度压力测试报告

这是第一段：在高性能 Web 应用开发中，DOM 操作的开销往往是最大的瓶颈。传统的框架如 React 在处理这种**超高频流式数据**时，会因为虚拟 DOM 的频繁对比导致主线程阻塞。

这是第二段：通过引入 **Web Worker** 和 **原生 DOM 调度**，我们成功绕过了框架的冗余逻辑。

### 性能对比表
| 维度 | 传统框架 | PureFlow 2.0 | 评价 |
| :--- | :--- | :--- | :--- |
| 初始响应 | 120ms | **12ms** | 提升 10 倍 |
| 内存占用 | 250MB | 45MB | 极度精简 |
| 渲染稳定性 | 偶有掉帧 | 恒定 60FPS | 稳如磐石 |

下面是一个复杂的任务调度器测试：

\`\`\`javascript
// 模拟一个高性能的任务调度器
class TaskScheduler {
constructor() {
  this.queue = [];
  this.isProcessing = false;
}

push(task) {
  this.queue.push(task);
  if (!this.isProcessing) this.process();
}

process() {
  this.isProcessing = true;
  requestAnimationFrame(() => {
    const task = this.queue.shift();
    if (task) {
      task();
      this.process();
    } else {
      this.isProcessing = false;
    }
  });
}
}
\`\`\`

#### 垂直领域打通总结：
1. **词法分析前置** 到 Worker。
2. **调度逻辑绑定** RAF。
3. **样式利用** Tailwind v4 原子化。

测试结束。`

  let i = 0
  while (i < text.length) {
    const remaining = text.slice(i)
    const char = text[i]

    if (!state.isCodeBlock && (i === 0 || text[i - 1] === '\n')) {
      const hMatch = remaining.match(/^(#{1,6})\s+(.*?)(\n|$)/)
      if (hMatch) {
        sendToken({ type: `H${hMatch[1].length}`, value: hMatch[2] })
        i += hMatch[0].length
        continue
      }

      const tMatch = remaining.match(/^\|(.+)\|(\n|$)/)
      if (tMatch) {
        if (!state.isInTable) {
          sendToken({ type: 'TABLE_START' })
          state.isInTable = true
        }
        const cells = tMatch[1].split('|').map((c) => c.trim())
        if (!cells.every((c) => c.match(/^[: -]+$/))) {
          sendToken({ type: 'TABLE_ROW', cells })
        }
        i += tMatch[0].length
        continue
      } else if (state.isInTable) {
        sendToken({ type: 'TABLE_END' })
        state.isInTable = false
      }
    }

    if (text.startsWith('```', i)) {
      sendToken({ type: state.isCodeBlock ? 'CODE_END' : 'CODE_START' })
      state.isCodeBlock = !state.isCodeBlock
      const nextNL = text.indexOf('\n', i)
      i = state.isCodeBlock && nextNL !== -1 ? nextNL + 1 : i + 3
      continue
    }

    if (!state.isCodeBlock && text.startsWith('**', i)) {
      sendToken({ type: state.isBold ? 'BOLD_END' : 'BOLD_START' })
      state.isBold = !state.isBold
      i += 2
      continue
    }

    if (!state.isCodeBlock && !state.isInTable && char === '\n') {
      sendToken({ type: 'NEW_LINE' })
    } else {
      sendToken({ type: 'TEXT', value: char })
    }

    i++
    if (i % 5 === 0) await new Promise((r) => setTimeout(r, 5))
  }
  self.postMessage({ type: 'DONE' })
}

function sendToken(token) {
  self.postMessage({ type: 'TOKEN', token })
}
