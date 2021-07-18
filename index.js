import {convert} from 'unist-util-is'
import {pointStart, pointEnd} from 'unist-util-position'
import {modifyChildren} from 'unist-util-modify-children'
import {toString} from 'nlcst-to-string'

const word = convert('WordNode')
const punctuationOrSymbol = convert(['PunctuationNode', 'SymbolNode'])
const applicable = convert(['WordNode', 'PunctuationNode', 'SymbolNode'])

const slashes = /^\/{1,3}$/

/**
 * Plugin to classify url-like values (`example.com`, `index.html`,
 * `www.alpha.bravo`) as syntax instead of natural language.
 *
 * @type {import('unified').Plugin<[]>}
 */
export default function retextSyntaxUrls() {
  /**
   * @typedef {import('unist').Node} Node
   * @typedef {import('unist').Literal<string>} Literal
   * @typedef {import('unist').Parent} Parent
   */

  // @ts-expect-error: Assume attached.
  // type-coverage:ignore-next-line
  this.Parser.prototype.useFirst('tokenizeSentence', modifyChildren(mergeLinks))

  /**
   * @param {Node} child
   * @param {number} index
   * @param {Parent} parent
   * @returns {number|void}
   */
  // eslint-disable-next-line complexity
  function mergeLinks(child, index, parent) {
    const siblings = parent.children
    let start = index
    let end = index
    const currentIndex = index
    /** @type {Node[]} */
    const nodes = [child]

    if (!punctuationOrSymbol(child) || toString(child) !== '.') {
      return
    }

    /** @type {Node?} */
    let previous

    // Find preceding word/punctuation.
    // Stop before slashes, break after `www`.
    while ((previous = siblings[start - 1])) {
      if (
        !applicable(previous) ||
        (punctuationOrSymbol(previous) && slashes.test(toString(previous)))
      ) {
        break
      }

      start--

      nodes.unshift(siblings[start])

      if (word(previous) && toString(siblings[start]) === 'www') {
        break
      }
    }

    // Find following word/punctuation.
    let next = siblings[end + 1]
    while (applicable(next)) {
      end++
      nodes.push(next)
      next = siblings[end + 1]
    }

    // This full stop doesnt look like a link:  it’s either not followed, or not
    // preceded, by words or punctuation.
    if (currentIndex === start || currentIndex === end) {
      return
    }

    // 1-3 slashes.
    previous = siblings[start - 1]
    if (punctuationOrSymbol(previous) && slashes.test(toString(previous))) {
      start--
      nodes.unshift(siblings[start])
    }

    // URL protocol and colon.
    previous = siblings[start - 1]
    if (
      punctuationOrSymbol(previous) &&
      toString(previous) === ':' &&
      word(siblings[start - 2])
    ) {
      nodes.unshift(siblings[start - 2], previous)
      start -= 2
    }

    /** @type {string|undefined} */
    let value

    // Remove the last node if it’s punctuation, unless it’s `/` or `)`.
    if (punctuationOrSymbol(siblings[end])) {
      value = toString(siblings[end])

      if (value !== '/' && value !== ')') {
        end--
        nodes.pop()
      }
    }

    /** @type {Literal} */
    const replacement = {type: 'SourceNode', value: toString(nodes)}
    const initial = pointStart(nodes[0])
    const final = pointEnd(nodes[nodes.length - 1])

    if (initial.line && final.line) {
      replacement.position = {start: initial, end: final}
    }

    // Remove the nodes and insert a SourceNode.
    siblings.splice(start, end - start + 1, replacement)

    // Ignore the following full-stop: it’s not part of a link.
    if (value === '.') {
      index++
    }

    return index + 1
  }
}
