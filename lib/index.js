/**
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').SentenceContent} SentenceContent
 * @typedef {import('nlcst').Source} Source
 *
 * @typedef {import('unified').Processor} Processor
 */

import {ccount} from 'ccount'
import {toString} from 'nlcst-to-string'
import {pointEnd, pointStart} from 'unist-util-position'
import {modifyChildren} from 'unist-util-modify-children'

const slashes = /^\/{1,3}$/

/**
 * Classify url-like values (`example.com`, `index.html`, `www.alpha.bravo`) as
 * syntax instead of natural language.
 *
 * @this {Processor}
 *   Processor.
 * @returns {undefined}
 *   Nothing.
 */
export default function retextSyntaxUrls() {
  // Register extension for parser.
  let sentence = this.data('nlcstSentenceExtensions')

  if (!sentence) {
    this.data('nlcstSentenceExtensions', (sentence = []))
  }

  sentence.push(modifyChildren(mergeLinks))
}

/**
 * @param {SentenceContent} child
 *   Sentence content.
 * @param {number} index
 *   Position of `child` in `parent`.
 * @param {Sentence} parent
 *   Sentence.
 * @returns {number | undefined}
 *   Next index.
 */
// eslint-disable-next-line complexity
function mergeLinks(child, index, parent) {
  // Look for a dot.
  // Note: we also allow `:` here (even though there’s no TLD) to allow
  // `localhost` URLs.
  if (child.type !== 'PunctuationNode' && child.type !== 'SymbolNode') {
    return
  }

  const punc = toString(child)

  if (punc !== '.' && punc !== ':') {
    return
  }

  /** @type {Array<SentenceContent>} */
  const nodes = [child]
  let start = index
  let end = index

  /** @type {SentenceContent | undefined} */
  let previous

  // Find preceding word/punctuation.
  // Stop before slashes, break after `www`.
  while ((previous = parent.children[start - 1])) {
    if (
      !(
        previous.type === 'WordNode' ||
        previous.type === 'PunctuationNode' ||
        previous.type === 'SymbolNode'
      ) ||
      ((previous.type === 'PunctuationNode' ||
        previous.type === 'SymbolNode') &&
        slashes.test(toString(previous)))
    ) {
      break
    }

    start--

    nodes.unshift(parent.children[start])

    if (
      previous.type === 'WordNode' &&
      toString(parent.children[start]) === 'www'
    ) {
      break
    }
  }

  if (punc === ':' && toString(nodes) !== 'localhost:') {
    return
  }

  // Find following word/punctuation.
  let next = parent.children[end + 1]
  while (
    next &&
    (next.type === 'WordNode' ||
      next.type === 'PunctuationNode' ||
      next.type === 'SymbolNode')
  ) {
    end++
    nodes.push(next)
    next = parent.children[end + 1]
  }

  // This full stop doesnt look like a link:  it’s either not followed, or not
  // preceded, by words or punctuation.
  if (index === start || index === end) {
    return
  }

  // 1-3 slashes.
  previous = parent.children[start - 1]
  if (
    previous &&
    (previous.type === 'PunctuationNode' || previous.type === 'SymbolNode') &&
    slashes.test(toString(previous))
  ) {
    start--
    nodes.unshift(parent.children[start])
  }

  // URL protocol and colon.
  previous = parent.children[start - 1]
  if (
    previous &&
    (previous.type === 'PunctuationNode' || previous.type === 'SymbolNode') &&
    toString(previous) === ':' &&
    parent.children[start - 2].type === 'WordNode'
  ) {
    nodes.unshift(parent.children[start - 2], previous)
    start -= 2
  }

  /** @type {string} */
  let value = ''

  // Remove the last node if it’s punctuation, unless it’s `/` or `)`.
  if (
    parent.children[end].type === 'PunctuationNode' ||
    parent.children[end].type === 'SymbolNode'
  ) {
    value = toString(parent.children[end])

    if (value === ')') {
      const value = toString(nodes)
      // If there are more closing parens than opening ones, it’s likely
      // that the paren doesn’t belong to the URL.
      if (ccount(value, '(') < ccount(value, ')')) {
        end--
        nodes.pop()
      }
    } else if (value !== '/') {
      end--
      nodes.pop()
    }
  }

  // Exit if the TLD is only 1 character long.
  if (toString(parent.children.slice(index + 1, end + 1)).length === 1) {
    return
  }

  /** @type {Source} */
  const replacement = {type: 'SourceNode', value: toString(nodes)}
  const initial = pointStart(nodes[0])
  const final = pointEnd(nodes[nodes.length - 1])

  if (initial && final) {
    replacement.position = {start: initial, end: final}
  }

  // Remove the nodes and insert a SourceNode.
  parent.children.splice(start, end - start + 1, replacement)

  // Ignore the following full-stop: it’s not part of a link.
  if (value === '.') {
    index++
  }

  return index + 1
}
