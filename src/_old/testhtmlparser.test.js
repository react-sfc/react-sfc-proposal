// import { parseHTML } from './html-parser'

// xtest('foobar', async () => {
//   const foo = parseHTML('<div>isjdlksj</div>', {})
//   expect(foo).toBe('export default "Hey Alice!"')
// })

import { parseComponent } from '../parse'

xtest('foobar', async () => {
  const foo = parseComponent('<div>isjdlksj</div>')
  expect(foo).toBe('export default "Hey Alice!"')
})
