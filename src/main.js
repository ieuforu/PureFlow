import './main.css'

let currentParent = document.querySelector('#content')
let currentNode = null
let currentBlock = null
let tokenQueue = []
let isUserScrolling = false

window.addEventListener(
  'wheel',
  () => {
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
    isUserScrolling = !isAtBottom
  },
  { passive: true },
)

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })

function handleToken(token, container) {
  switch (token.type) {
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      const h = document.createElement(token.type.toLowerCase())
      const sizes = { H1: 'text-3xl', H2: 'text-2xl', H3: 'text-xl', H4: 'text-lg' }
      h.className = `${sizes[token.type] || 'text-base'} font-bold mt-6 mb-2 text-slate-900`
      h.textContent = token.value
      container.appendChild(h)
      currentBlock = null
      currentNode = null
      break

    case 'TABLE_START':
      const table = document.createElement('table')
      table.className = 'w-full border-collapse border border-slate-200 my-4 text-sm'
      const tbody = document.createElement('tbody')
      table.appendChild(tbody)
      container.appendChild(table)
      currentBlock = tbody
      break

    case 'TABLE_ROW':
      const tr = document.createElement('tr')
      tr.className = 'even:bg-slate-50'
      token.cells.forEach((cellText) => {
        const td = document.createElement('td')
        td.className = 'border border-slate-200 px-4 py-2'
        td.innerHTML = cellText.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold text-slate-900">$1</strong>',
        )
        tr.appendChild(td)
      })
      if (currentBlock) currentBlock.appendChild(tr)
      break

    case 'CODE_START':
      const pre = document.createElement('pre')
      const code = document.createElement('code')
      pre.className =
        'relative group bg-slate-900 text-indigo-300 p-4 rounded-xl my-4 block font-mono text-sm overflow-x-auto shadow-inner'
      const copyBtn = document.createElement('button')
      copyBtn.innerHTML = 'Copy'
      copyBtn.className =
        'absolute right-3 top-3 px-2 py-1 text-xs font-sans bg-slate-800 text-slate-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 hover:text-white cursor-pointer'
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(code.innerText).then(() => {
          copyBtn.innerHTML = 'Copied!'
          setTimeout(() => (copyBtn.innerHTML = 'Copy'), 2000)
        })
      }
      pre.append(copyBtn, code)
      container.appendChild(pre)
      currentNode = code
      currentBlock = pre
      break

    case 'TEXT':
      const target = currentNode || currentBlock || ensureBlock(container)
      target.append(token.value)
      break

    case 'NEW_LINE':
      currentBlock = null
      currentNode = null
      break

    case 'TABLE_END':
    case 'CODE_END':
    case 'BOLD_END':
      currentNode = null
      if (token.type === 'TABLE_END') currentBlock = null
      break

    case 'BOLD_START':
      const strong = document.createElement('strong')
      strong.className = 'font-bold text-slate-900'
      const p = currentNode || currentBlock || ensureBlock(container)
      p.appendChild(strong)
      currentNode = strong
      break
  }
}

function ensureBlock(container) {
  if (!currentBlock || currentBlock.tagName === 'TBODY' || currentBlock.tagName === 'PRE') {
    currentBlock = document.createElement('p')
    currentBlock.className = 'mb-4 leading-relaxed text-slate-700'
    container.appendChild(currentBlock)
  }
  return currentBlock
}

worker.onmessage = (e) => {
  if (e.data.type === 'TOKEN') tokenQueue.push(e.data.token)
}

function renderLoop() {
  if (tokenQueue.length > 0) {
    const fragment = document.createDocumentFragment()

    while (tokenQueue.length > 0) {
      handleToken(tokenQueue.shift(), fragment)
    }

    currentParent.appendChild(fragment)

    if (!isUserScrolling) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    }
  }
  requestAnimationFrame(renderLoop)
}

requestAnimationFrame(renderLoop)

document.querySelector('#start').addEventListener('click', () => {
  currentParent.innerHTML = ''
  currentNode = null
  currentBlock = null
  tokenQueue = []
  isUserScrolling = false
  worker.postMessage({ type: 'START_STREAM' })
})
