import { getOptions } from 'loader-utils'
import { parseComponent } from './parse'
export default function loader(source) {
  const options = getOptions(this)
  console.log({ source: parseComponent(source) })
  source = source.replace(/\[name\]/g, options.name)
  return `export default ${JSON.stringify(source)}`
}

export const sdsd = {
  styles: [
    {
      type: 'style',
      content: '\ndiv {\n  border: 1px solid red\n}\n',
      start: 92,
      attrs: {},
      end: 131
    }
  ],
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
