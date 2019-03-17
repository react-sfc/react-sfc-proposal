import parser from 'posthtml-parser'

/**
 * Parse file content (html) and categorize it by tag and type
 *
 */
export function parse(content) {
  let output = {}
  const nodes = parser(content)
  forEach(nodes, node => {
    // if (isObject(node) && isCorrectTag(node)) {
    append(output, [node.tag, getType(node)], getContent(node))
    // }
  })
  return output
}

function getType(node) {
  return node.attrs.type
}
function getContent(node) {
  return (node.content || []).join(' ')
}
