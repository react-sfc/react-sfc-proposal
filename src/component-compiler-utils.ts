import { SourceMapGenerator } from 'source-map'
import { SFCDescriptor, ParseOptions, parseHTMLOptions } from './types'

const hash = require('hash-sum')
let cache = require('lru-cache')
cache = new cache(100)

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

export function parse(options: ParseOptions): SFCDescriptor {
  const {
    source,
    filename = '',
    compiler,
    compilerParseOptions = { pad: 'line' } as parseHTMLOptions,
    sourceRoot = '',
    needMap = true
  } = options
  const cacheKey = hash(filename + source)

  let output: SFCDescriptor = cache.get(cacheKey)
  if (output) return output
  output = compiler.parseComponent(source, compilerParseOptions)
  if (needMap) {
    if (output.script && !output.script.src) {
      output.script.map = generateSourceMap(
        filename,
        source,
        output.script.content,
        sourceRoot,
        compilerParseOptions.pad
      )
    }
    if (output.styles) {
      output.styles.forEach(style => {
        if (!style.src) {
          style.map = generateSourceMap(filename, source, style.content, sourceRoot, compilerParseOptions.pad)
        }
      })
    }
  }
  cache.set(cacheKey, output)
  return output
}

function generateSourceMap(
  filename: string,
  source: string,
  generated: string,
  sourceRoot: string,
  pad?: 'line' | 'space'
) {
  // ): RawSourceMap {
  const map = new SourceMapGenerator({
    file: filename.replace(/\\/g, '/'),
    sourceRoot: sourceRoot.replace(/\\/g, '/')
  })
  let offset = 0
  if (!pad) {
    offset =
      source
        .split(generated)
        .shift()!
        .split(splitRE).length - 1
  }
  map.setSourceContent(filename, source)
  generated.split(splitRE).forEach((line, index) => {
    if (!emptyRE.test(line)) {
      map.addMapping({
        source: filename,
        original: {
          line: index + 1 + offset,
          column: 0
        },
        generated: {
          line: index + 1,
          column: 0
        }
      })
    }
  })
  return JSON.parse(map.toString())
}
