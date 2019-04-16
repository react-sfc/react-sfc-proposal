# How Vue-Loader works

Vue-loader is key to making Vue SFCs work and therefore a significant part of the Vue Developer Experience.

First you should familiarise yourself with the Vue-loader docs. https://vue-loader.vuejs.org/guide/#vue-cli. There have been notable changes between v15+ and v14, particularly the use of a plugin alongside the loader.

These are high level notes taken while exploring the vue-loader codebase from someone who isn't otherwise familiar with Vue internals (as well as new to writing webpack loaders in general). please pardon any mistakes and omissions and get in touch [@swyx](https://twitter.com/swyx) to correct/fix/discuss!

## `Vue-Loader`

**Parsing**

Vue Loader takes a source `*.vue` file and splits it up into a simple data structure ([source](https://github.com/vuejs/vue/blob/dev/src/sfc/parser.js#L14)). `template`s, and `script`s must be unique, while `styles` can have an array. Unrecognized tags are collected `customBlocks` and malformatted tag warnings are collected in `errors`.

The parsing also tracks start/end positions for [Sourcemap generation](https://github.com/vuejs/component-compiler-utils/blob/master/lib/parse.ts#L61).

**the Loader**

The loader uses a nifty "recursive" strategy using [webpack's query system](https://webpack.js.org/api/loaders/#the-loader-context). This is probably enabled by the plugin (see the `vue-loader-plugin` section below)

- If an incoming query has no `type` field, Every tag block is [transformed](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L118) into a request that looks like `path.to.resource.vue?vue&type=template&id=123&scoped=true&someAttr=foo`. This is then injected into the final js code to be processed by webpack.. but it is requesting ITSELF!
- If an incoming query has a `type` field, it [returns the raw text of its block](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L79-L84) no questions asked.

This way each tag block becomes a "virtual file" inside webpack (my words).

All tags are optional in the SFC format:

- if `<template>` is omitted, [`render` and `staticRenderFn` variables are declared](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L111)
- if `<script>` is omitted, [`script` is an empty object.](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L124).
- if there are no `<style>`s, nothing is injected.
- Regardless of what tags are present, all SFCs are ["normalized" for cleaner component output](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/runtime/componentNormalizer.js).
- finally, [custom blocks](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L170) are handled.

[Hot reloading is also handled here](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L179).

Everything is catted together and [the component is exported in the final code output](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L193).

[**getStylesCode**](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/codegen/styleInjection.js)

This code is responsible for handling `<style>` tag requests. It has special handling for CSS Modules and hot reloading them I want to look into in future. [Scoped styles are transformed in a custom PostCSS plugin inside yet another lower level library](https://github.com/vuejs/component-compiler-utils/blob/master/lib/stylePlugins/scoped.ts).

[**genCustomBlocksCode**](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/codegen/customBlocks.js)

I'm still not sure how this works. it seems to rely on the `blockType` to do something, which you specify in your webpack config. worth investigating. [Example here](https://github.com/vuejs/vue-loader/blob/64af07915ac47ebb6bad3223fd2bd15dee908196/example/webpack.config.js).

[**genHotReloadCode**](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/codegen/hotReload.js)

Looks simple? uses `vue-hot-reload-api`.

## `Vue-Loader-Plugin`

This was only added in v15+ and is surprisingly simple:

- [Validate and get the `.vue` webpack loader rule](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/plugin.js#L34-76). No more and no less than one is allowed.
- [Clone all other rules that are not \*.vue.](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/plugin.js#L80)
- [pitch up loaders for templates and CSS](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/plugin.js#L84-96)
- [insert the cloned rules](https://github.com/vuejs/vue-loader/blob/40bcb3d75cebb5227aa21bd82cb601754b0ce2aa/lib/plugin.js#L101) before the regular rules

## Misc notes

- the parsing is done using john resig's [html parser](https://github.com/vuejs/vue/blob/dev/src/compiler/parser/html-parser.js) which is a great choice as compared to some other appproaches (eg using [posthtml-parse](https://github.com/posthtml/posthtml)) since you really only need to parse one level down
- some of the code is typescript, some flow, some plain JS. it's cool to see a codebase in the midst of transition.
- always a good idea to [expose the filepath](https://github.com/vuejs/vue-loader/blob/master/lib/index.js#L186) in development for devtools
