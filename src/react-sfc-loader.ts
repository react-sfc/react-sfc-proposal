const path = require('path')
const hash = require('hash-sum')
const qs = require('querystring')
const plugin = require('./plugin')
const selectBlock = require('./select')
const loaderUtils = require('loader-utils')
const { attrsToQuery } = require('./codegen/utils')
const { parse } = require('./component-compiler-utils')
import { parseComponent } from './parse'
import { LoaderContextType } from './types'
const genStylesCode = require('./codegen/styleInjection')
// const { genHotReloadCode } = require('./codegen/hotReload')
// const genCustomBlocksCode = require('./codegen/customBlocks')
// const componentNormalizerPath = require.resolve('./runtime/componentNormalizer')
const { NS } = require('./plugin')

let errorEmitted = false

module.exports = function(this: LoaderContextType, source: string) {
  const loaderContext = this

  if (!errorEmitted && !loaderContext['thread-loader'] && !loaderContext[NS]) {
    loaderContext.emitError &&
      loaderContext.emitError(
        new Error(
          `react-sfc-loader was used without the corresponding plugin. ` +
            `Make sure to include SFCLoaderPlugin in your webpack config.`
        )
      )
    errorEmitted = true
  }

  const stringifyRequest = (r: string) => loaderUtils.stringifyRequest(loaderContext, r)

  const {
    target,
    // request,
    minimize,
    sourceMap,
    rootContext,
    resourcePath,
    resourceQuery
  } = loaderContext

  const rawQuery = resourceQuery.slice(1)
  const inheritQuery = `&${rawQuery}`
  const incomingQuery = qs.parse(rawQuery)
  const options = loaderUtils.getOptions(loaderContext) || {}

  const isServer = target === 'node'
  const isShadow = !!options.shadowMode
  const isProduction = options.productionMode || minimize || process.env.NODE_ENV === 'production'
  const filename = path.basename(resourcePath)
  const context = rootContext || process.cwd()
  const sourceRoot = path.dirname(path.relative(context, resourcePath))

  const descriptor = parse({
    source,
    compiler: options.compiler || { parseComponent },
    filename,
    sourceRoot,
    needMap: sourceMap
  })

  // if the query has a type field, this is a language block request
  // e.g. foo.sfc?type=template&id=xxxxx
  // and we will return early
  if (incomingQuery.type) {
    return selectBlock(descriptor, loaderContext, incomingQuery, !!options.appendExtension)
  }

  // module id for scoped CSS & hot-reload
  const rawShortFilePath = path.relative(context, resourcePath).replace(/^(\.\.[\/\\])+/, '')

  const shortFilePath = rawShortFilePath.replace(/\\/g, '/') + resourceQuery

  const id = hash(isProduction ? shortFilePath + '\n' + source : shortFilePath)

  // feature information
  // const hasScoped = descriptor.styles.some(s => s.scoped)
  const needsHotReload =
    !isServer && !isProduction && (descriptor.script || descriptor.template) && options.hotReload !== false

  // script
  let scriptImport = `var script = {}`
  if (descriptor.script) {
    const src = descriptor.script.src || resourcePath
    const attrsQuery = attrsToQuery(descriptor.script.attrs, 'js')
    const query = `?sfc&type=script${attrsQuery}${inheritQuery}`
    const request = stringifyRequest(src + query)
    scriptImport = `import script from ${request}\n` + `export * from ${request}` // support named exports
  }

  // styles
  let stylesCode = ``
  if (descriptor.styles.length) {
    stylesCode = genStylesCode(
      loaderContext,
      descriptor.styles,
      id,
      resourcePath,
      stringifyRequest,
      needsHotReload,
      isServer || isShadow // needs explicit injection?
    )
  }

  let code =
    `
${scriptImport}
${stylesCode}

  `.trim() + `\n`

  // SWYX: TODO: normalizer code from vue-loader
  // /* normalize component */
  // import normalizer from ${stringifyRequest(`!${componentNormalizerPath}`)}
  // var component = normalizer(
  //   script,
  //   render,
  //   staticRenderFns,
  //   ${hasFunctional ? `true` : `false`},
  //   ${/injectStyles/.test(stylesCode) ? `injectStyles` : `null`},
  //   ${hasScoped ? JSON.stringify(id) : `null`},
  //   ${isServer ? JSON.stringify(hash(request)) : `null`}
  //   ${isShadow ? `,true` : ``}
  // )
  // // SWYX: TODO
  // if (descriptor.customBlocks && descriptor.customBlocks.length) {
  //   code += genCustomBlocksCode(descriptor.customBlocks, resourcePath, resourceQuery, stringifyRequest)
  // }

  // // SWYX: TODO
  // if (needsHotReload) {
  //   code += `\n` + genHotReloadCode(id, hasFunctional, templateRequest)
  // }

  // Expose filename. This is used by the devtools and React runtime warnings.
  if (!isProduction) {
    // Expose the file's full path in development, so that it can be opened
    // from the devtools.
    code += `\ncomponent.options.__file = ${JSON.stringify(rawShortFilePath.replace(/\\/g, '/'))}`
  } else if (options.exposeFilename) {
    // Libraies can opt-in to expose their components' filenames in production builds.
    // For security reasons, only expose the file's basename in production.
    code += `\ncomponent.options.__file = ${JSON.stringify(filename)}`
  }

  code += `\nexport default component.exports`
  console.log({ code })
  return code
}

module.exports.SFCLoaderPlugin = plugin
