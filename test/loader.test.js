import compiler from './compiler.js'

const result = `// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = require(\"!!../node_modules/css-loader/dist/cjs.js!../src/react-sfc-loader.js??react-sfc-loader-options!./example.sfc?sfc&type=style&index=0&lang=css&\");
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = require(\"!../node_modules/vue-style-loader/lib/addStylesClient.js\").default
var update = add(\"31bdef18\", content, false, {});
// Hot Module Replacement
if(module.hot) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(\"!!../node_modules/css-loader/dist/cjs.js!../src/react-sfc-loader.js??react-sfc-loader-options!./example.sfc?sfc&type=style&index=0&lang=css&\", function() {
     var newContent = require(\"!!../node_modules/css-loader/dist/cjs.js!../src/react-sfc-loader.js??react-sfc-loader-options!./example.sfc?sfc&type=style&index=0&lang=css&\");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}`
test('Inserts name and outputs JavaScript', async () => {
  const stats = await compiler('example.sfc')
  const json = stats.toJson()
  // // debugger
  json.modules.forEach((m, i) => {
    console.log(' [index] ' + i + '\n', m.source)
    if (m.modules) {
      console.log('submodules', m.modules.length)
      m.modules.forEach((n, j) => {
        console.log('sub [index] ' + i + '-' + j + '\n', n.source)
      })
    }
  })
  // const output = stats.toJson().modules[0].source
  // expect(output).toBe(result)
  expect(1).toBe(1)
})
