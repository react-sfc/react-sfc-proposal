import compiler from './compiler.js'

test('Inserts name and outputs JavaScript', async () => {
  const stats = await compiler('example.sfc')
  const sfcast = {
    styles: [{ type: 'style', content: '\ndiv {\n  border: 1px solid red\n}\n', start: 92, attrs: {}, end: 131 }],
    customBlocks: [
      {
        type: 'jsx',
        content: '\nexport default function MyComponent() {\n  return <div>hi</div>\n}\n',
        start: 5,
        attrs: {},
        end: 77
      }
    ],
    errors: []
  }
  const output = stats.toJson().modules[0].source
  expect(output).toBe(sfcast)
})
