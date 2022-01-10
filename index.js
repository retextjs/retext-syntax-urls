/**
 * @typedef {import('nlcst').Root} Root
 * @typedef {import('nlcst').Sentence} Sentence
 * @typedef {import('nlcst').Source} Source
 * @typedef {import('nlcst').SentenceContent} SentenceContent
 */

import {pointStart, pointEnd} from 'unist-util-position'
import {modifyChildren} from 'unist-util-modify-children'
import {toString} from 'nlcst-to-string'
import {ccount} from 'ccount'

const slashes = /^\/{1,3}$/

/**
 * Plugin to classify url-like values (`example.com`, `index.html`,
 * `www.alpha.bravo`) as syntax instead of natural language.
 *
 * @type {import('unified').Plugin<[], Root>}
 */
export default function retextSyntaxUrls() {
  // @ts-expect-error: Assume attached.
  // type-coverage:ignore-next-line
  this.Parser.prototype.useFirst('tokenizeSentence', modifyChildren(mergeLinks))

  /**
   * @param {SentenceContent} child
   * @param {number} index
   * @param {Sentence} parent
   * @returns {number|void}
   */
  // eslint-disable-next-line complexity
  function mergeLinks(child, index, parent) {
    const siblings = parent.children
    let start = index
    let end = index
    const currentIndex = index
    /** @type {SentenceContent[]} */
    const nodes = [child]
    const punc = toString(child)

    // Look for a dot.
    // Note: we also allow `:` here (even though there’s no TLD) to allow
    // `localhost` URLs.
    if (
      !(child.type === 'PunctuationNode' || child.type === 'SymbolNode') ||
      (punc !== '.' && punc !== ':')
    ) {
      return
    }

    /** @type {SentenceContent|undefined} */
    let previous

    // Find preceding word/punctuation.
    // Stop before slashes, break after `www`.
    while ((previous = siblings[start - 1])) {
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

      nodes.unshift(siblings[start])

      if (previous.type === 'WordNode' && toString(siblings[start]) === 'www') {
        break
      }
    }

    if (punc === ':' && toString(nodes) !== 'localhost:') {
      return
    }

    // Find following word/punctuation.
    let next = siblings[end + 1]
    while (
      next &&
      (next.type === 'WordNode' ||
        next.type === 'PunctuationNode' ||
        next.type === 'SymbolNode')
    ) {
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
    if (
      previous &&
      (previous.type === 'PunctuationNode' || previous.type === 'SymbolNode') &&
      slashes.test(toString(previous))
    ) {
      start--
      nodes.unshift(siblings[start])
    }

    // URL protocol and colon.
    previous = siblings[start - 1]
    if (
      previous &&
      (previous.type === 'PunctuationNode' || previous.type === 'SymbolNode') &&
      toString(previous) === ':' &&
      siblings[start - 2].type === 'WordNode'
    ) {
      nodes.unshift(siblings[start - 2], previous)
      start -= 2
    }

    /** @type {string|undefined} */
    let value

    // Remove the last node if it’s punctuation, unless it’s `/` or `)`.
    if (
      siblings[end].type === 'PunctuationNode' ||
      siblings[end].type === 'SymbolNode'
    ) {
      value = toString(siblings[end])

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
    if (toString(siblings.slice(index + 1, end + 1)).length === 1) {
      return
    }

    /** @type {Source} */
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
