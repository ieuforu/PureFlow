let isBold = false
let isCodeBlock = false
let isInTable = false

self.onmessage = (e) => {
  if (e.data.type === 'START_STREAM') {
    isBold = false
    isCodeBlock = false
    isInTable = false
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

    const headerMatch = remaining.match(/^(#{1,6})\s+(.*?)(\n|$)/)
    if (!isCodeBlock && headerMatch && (i === 0 || text[i - 1] === '\n')) {
      const level = headerMatch[1].length
      self.postMessage({ type: 'TOKEN', token: { type: `H${level}`, value: headerMatch[2] } })
      i += headerMatch[0].length
      continue
    }

    const tableRowMatch = remaining.match(/^\|(.+)\|(\n|$)/)
    if (!isCodeBlock && tableRowMatch && (i === 0 || text[i - 1] === '\n')) {
      if (!isInTable) {
        self.postMessage({ type: 'TOKEN', token: { type: 'TABLE_START' } })
        isInTable = true
      }
      const cells = tableRowMatch[1].split('|').map((c) => c.trim())
      if (cells.every((c) => c.match(/^-+$/) || c.match(/^:?-+:?$/))) {
        i += tableRowMatch[0].length
        continue
      }
      self.postMessage({ type: 'TOKEN', token: { type: 'TABLE_ROW', cells } })
      i += tableRowMatch[0].length
      continue
    } else if (isInTable && char === '\n' && !remaining.slice(1).startsWith('|')) {
      self.postMessage({ type: 'TOKEN', token: { type: 'TABLE_END' } })
      isInTable = false
    }

    if (text.startsWith('```', i)) {
      if (!isCodeBlock) {
        self.postMessage({ type: 'TOKEN', token: { type: 'CODE_START' } })
        const nextNL = text.indexOf('\n', i)
        i = nextNL !== -1 ? nextNL + 1 : i + 3
      } else {
        self.postMessage({ type: 'TOKEN', token: { type: 'CODE_END' } })
        i += 3
      }
      isCodeBlock = !isCodeBlock
      continue
    }

    if (!isCodeBlock && text.startsWith('**', i)) {
      self.postMessage({ type: 'TOKEN', token: { type: isBold ? 'BOLD_END' : 'BOLD_START' } })
      isBold = !isBold
      i += 2
      continue
    }

    if (!isCodeBlock && !isInTable && char === '\n') {
      self.postMessage({ type: 'TOKEN', token: { type: 'NEW_LINE' } })
      i++
      continue
    }

    self.postMessage({ type: 'TOKEN', token: { type: 'TEXT', value: char } })
    i++

    await new Promise((r) => setTimeout(r, 10))
  }

  self.postMessage({ type: 'DONE' })
}
