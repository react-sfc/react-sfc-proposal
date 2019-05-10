import { SFCDescriptor, LoaderContextType } from './types'
const postcss = require('postcss')
const postcssplugins = [require('postcss-nested')]

type QueryType = {
  type: string
  index: number
  id: string
}

module.exports = function selectBlock(
  descriptor: SFCDescriptor,
  loaderContext: LoaderContextType,
  query: QueryType,
  appendExtension: boolean
) {
  // script
  if (query.type === `script` && descriptor.script) {
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (descriptor.script.lang || 'js')
    }
    console.log('calling script callback', query)
    loaderContext.callback(
      null,
      `import React from "react" // injected by react-sfc-loader

${descriptor.script.content}
      `,
      descriptor.script.map
    )
    return
  }

  // styles
  if (query.type === `style` && query.index != null) {
    const style = descriptor.styles[query.index]
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (style.lang || 'css')
    }

    const wrappedStyle = `
    div[data-sfc-style='${query.id}'] {
      ${style.content}
    }
  `
    var callback = loaderContext.async()
    postcss(postcssplugins)
      .process(wrappedStyle, {
        from: style.src,
      })
      .then((processedStyle: string) => {
        console.log('calling style callback', query)
        callback(null, processedStyle, style.map as string) // swyx: there was a typeerr here but i just overwrote
      })
    // old code, synchronous
    // loaderContext.callback(null, style.content, style.map) // loosely typed so no typeerrr, sad
    return
  }

  // custom
  if (query.type === 'custom' && query.index != null) {
    const block = descriptor.customBlocks[query.index]
    console.log('calling block callback', query)
    loaderContext.callback(null, block.content, block.map)
    return
  }
}
