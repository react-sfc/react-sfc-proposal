import qs from 'querystring'
const RuleSet = require('webpack/lib/RuleSet')

const id = 'react-sfc-loader-plugin'
const NS = 'react-sfc-loader'

type ResourceType = (s: string) => boolean
type RuleType = {
  include?: string
  enforce?: unknown
  resource: ResourceType
  resourceQuery: Function
  oneOf?: RuleType[]
}
type CompilerType = {
  hooks: {
    compilation: {
      tap: Function
    }
  }
  plugin: Function
  options: {
    module: {
      rules: RuleType[]
    }
  }
}
type CompilationType = {
  hooks: {
    normalModuleLoader: unknown
  }
  plugin: Function
}

class SFCLoaderPlugin {
  static NS?: string
  apply(compiler: CompilerType) {
    // add NS marker so that the loader can detect and report missing plugin
    if (compiler.hooks) {
      // webpack 4
      compiler.hooks.compilation.tap(id, (compilation: CompilationType) => {
        let normalModuleLoader
        if (Object.isFrozen(compilation.hooks)) {
          // webpack 5
          normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(
            compilation
          ).loader
        } else {
          normalModuleLoader = compilation.hooks.normalModuleLoader
        }
        normalModuleLoader.tap(id, (loaderContext: Object) => {
          loaderContext[NS] = true
        })
      })
    } else {
      // webpack < 4
      compiler.plugin('compilation', (compilation: CompilationType) => {
        compilation.plugin('normal-module-loader', (loaderContext: Object) => {
          loaderContext[NS] = true
        })
      })
    }

    // use webpack's RuleSet utility to normalize user rules
    const rawRules = compiler.options.module.rules
    const { rules } = new RuleSet(rawRules)

    // find the rule that applies to sfc files
    let sfcRuleIndex = rawRules.findIndex(createMatcher(`foo.sfc`))
    if (sfcRuleIndex < 0) {
      sfcRuleIndex = rawRules.findIndex(createMatcher(`foo.sfc.html`))
    }
    const sfcRule = rules[sfcRuleIndex]

    if (!sfcRule) {
      throw new Error(
        `[sfcLoaderPlugin Error] No matching rule for .sfc files found.\n` +
          `Make sure there is at least one root-level rule that matches .sfc or .sfc.html files.`
      )
    }

    if (sfcRule.oneOf) {
      throw new Error(
        `[sfcLoaderPlugin Error] react-sfc-loader 15 currently does not support sfc rules with oneOf.`
      )
    }

    // get the normlized "use" for sfc files
    const sfcUse = sfcRule.use
    // get react-sfc-loader options
    const sfcLoaderUseIndex = sfcUse.findIndex((u: { loader: string }) => {
      return /^react-sfc-loader|(\/|\\|@)react-sfc-loader/.test(u.loader)
    })

    if (sfcLoaderUseIndex < 0) {
      throw new Error(
        `[sfcLoaderPlugin Error] No matching use for react-sfc-loader is found.\n` +
          `Make sure the rule matching .sfc files include react-sfc-loader in its use.`
      )
    }

    // make sure react-sfc-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??react-sfc-loader-options
    const sfcLoaderUse = sfcUse[sfcLoaderUseIndex]
    sfcLoaderUse.ident = 'react-sfc-loader-options'
    sfcLoaderUse.options = sfcLoaderUse.options || {}

    // for each user rule (expect the sfc rule), create a cloned rule
    // that targets the corresponding language blocks in *.sfc files.
    const clonedRules = rules
      .filter((r: string) => r !== sfcRule)
      .map(cloneRule)

    // global pitcher (responsible for injecting template compiler loader & CSS
    // post loader)
    const pitcher = {
      loader: require.resolve('./loaders/pitcher'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.sfc != null
      },
      options: {
        cacheDirectory: sfcLoaderUse.options.cacheDirectory,
        cacheIdentifier: sfcLoaderUse.options.cacheIdentifier,
      },
    }

    // replace original rules
    compiler.options.module.rules = [pitcher, ...clonedRules, ...rules]
  }
}
function createMatcher(fakeFile: string) {
  return (rule: RuleType) => {
    // #1201 we need to skip the `include` check when locating the sfc rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')
    return (
      !rule.enforce &&
      normalized.resource &&
      (normalized.resource(fakeFile) as boolean)
    )
  }
}

function cloneRule(rule: RuleType) {
  const { resource, resourceQuery } = rule
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource: ResourceType
  const res = Object.assign({}, rule, {
    resource: {
      test: (resource: ResourceType) => {
        currentResource = resource
        return true
      },
    },
    resourceQuery: (query: string) => {
      const parsed = qs.parse(query.slice(1))
      if (parsed.sfc == null) {
        return false
      }
      if (resource && parsed.lang == null) {
        return false
      }
      const fakeResourcePath = `${currentResource}.${parsed.lang}`
      if (resource && !resource(fakeResourcePath)) {
        return false
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false
      }
      return true
    },
  })

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRule)
  }

  return res
}

SFCLoaderPlugin.NS = NS
module.exports = SFCLoaderPlugin
