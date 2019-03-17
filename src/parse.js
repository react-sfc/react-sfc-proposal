import deindent from 'de-indent'
import { parseHTML } from './html-parser'

const splitRE = /\r?\n/g
const replaceRE = /./g
const tagAliasLookup = tag =>
  ({
    script: 'script',
    style: 'style'
  }[tag] || null)

/**
 * Parse a single-file component file into an SFC Descriptor Object.
 */
// export function parseComponent(content: string, options?: Object = {}): SFCDescriptor {
export function parseComponent(content, options = {}) {
  // const sfc: SFCDescriptor = {
  const sfc = {
    script: null,
    styles: [],
    customBlocks: [],
    errors: []
  }
  let depth = 0
  // let currentBlock: ?SFCBlock = null
  let currentBlock = null

  let warn = msg => {
    sfc.errors.push(msg)
  }

  if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
    warn = (msg, range) => {
      // const data: WarningMessage = { msg }
      const data = { msg }
      if (range.start != null) {
        data.start = range.start
      }
      if (range.end != null) {
        data.end = range.end
      }
      sfc.errors.push(data)
    }
  }

  // function start(tag: string, attrs: Array<ASTAttr>, unary: boolean, start: number, end: number) {
  function start(tag, attrs, unary, start, end) {
    if (depth === 0) {
      currentBlock = {
        type: tag,
        content: '',
        start: end,
        attrs: attrs.reduce((cumulated, { name, value }) => {
          cumulated[name] = value || true
          return cumulated
        }, {})
      }
      if (tag === 'style') {
        checkAttrs(currentBlock, attrs)
        sfc.styles.push(currentBlock)
      } else if (tag === 'script') {
        checkAttrs(currentBlock, attrs)
        sfc.script = currentBlock
      } else {
        // custom blocks
        sfc.customBlocks.push(currentBlock)
      }
    }
    if (!unary) {
      depth++
    }
  }

  // function checkAttrs(block: SFCBlock, attrs: Array<ASTAttr>) {
  function checkAttrs(block, attrs) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.name === 'lang') {
        block.lang = attr.value
      }
      if (attr.name === 'scoped') {
        block.scoped = true
      }
      if (attr.name === 'module') {
        block.module = attr.value || true
      }
      if (attr.name === 'src') {
        block.src = attr.value
      }
    }
  }

  // function end(tag: string, start: number) {
  function end(tag, start) {
    if (depth === 1 && currentBlock) {
      currentBlock.end = start
      let text = content.slice(currentBlock.start, currentBlock.end)
      if (options.deindent !== false) {
        text = deindent(text)
      }
      // pad content so that linters and pre-processors can output correct
      // line numbers in errors and warnings
      // if (currentBlock.type !== 'template' && options.pad) {
      if (options.pad) {
        text = padContent(currentBlock, options.pad) + text
      }
      currentBlock.content = text
      currentBlock = null
    }
    depth--
  }

  // function padContent(block: SFCBlock, pad: true | 'line' | 'space') {
  function padContent(block, pad) {
    if (pad === 'space') {
      return content.slice(0, block.start).replace(replaceRE, ' ')
    } else {
      const offset = content.slice(0, block.start).split(splitRE).length
      const padChar = block.type === 'script' && !block.lang ? '//\n' : '\n'
      return Array(offset).join(padChar)
    }
  }

  parseHTML(content, {
    warn,
    start,
    end,
    outputSourceRange: options.outputSourceRange
  })

  return sfc
}
