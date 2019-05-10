import { SFCDescriptor, LoaderContextType } from './types'

type QueryType = {
  type: string
  index: number
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
    loaderContext.callback(
      null,
      'import React from "react"\n' + descriptor.script.content,
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
    loaderContext.callback(null, style.content, style.map)
    return
  }

  // custom
  if (query.type === 'custom' && query.index != null) {
    const block = descriptor.customBlocks[query.index]
    loaderContext.callback(null, block.content, block.map)
    return
  }
}
