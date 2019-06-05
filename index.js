'use strict'

var position = require('unist-util-position')
var modifyChildren = require('unist-util-modify-children')
var toString = require('nlcst-to-string')

module.exports = urls

var slashes = /^\/{1,3}$/

function urls() {
  this.Parser.prototype.useFirst('tokenizeSentence', modifyChildren(mergeLinks))
}

// eslint-disable-next-line complexity
function mergeLinks(child, index, parent) {
  var siblings = parent.children
  var nodes = [child]
  var start = index
  var end = index
  var currentIndex = index
  var value
  var type
  var initial
  var final

  if (!puncOrSymbol(child.type) || toString(child) !== '.') {
    return
  }

  // Find preceding word/punctuation. Stop before slashes, break after `www`.
  while (siblings[start - 1]) {
    type = siblings[start - 1].type

    if (!applicable(type)) {
      break
    }

    if (puncOrSymbol(type) && slashes.test(toString(siblings[start - 1]))) {
      break
    }

    start--

    nodes.unshift(siblings[start])

    if (type === 'WordNode' && toString(siblings[start]) === 'www') {
      break
    }
  }

  // Find following word/punctuation.
  while (siblings[end + 1]) {
    type = siblings[end + 1].type

    if (!applicable(type)) {
      break
    }

    end++
    nodes.push(siblings[end])
  }

  // This full stop doesnt look like a link:  it’s either not followed, or not
  // preceded, by words or punctuation.
  if (currentIndex === start || currentIndex === end) {
    return
  }

  // 1-3 slashes.
  if (
    start > 0 &&
    puncOrSymbol(siblings[start - 1].type) &&
    slashes.test(toString(siblings[start - 1]))
  ) {
    start--
    nodes.unshift(siblings[start])
  }

  // URL protocol and colon.
  if (
    start > 2 &&
    puncOrSymbol(siblings[start - 1].type) &&
    toString(siblings[start - 1]) === ':' &&
    siblings[start - 2].type === 'WordNode'
  ) {
    nodes.unshift(siblings[start - 2], siblings[start - 1])
    start -= 2
  }

  value = null

  // Remove the last node if it's punctuation, unless it's `/` or `)`.
  if (puncOrSymbol(siblings[end].type)) {
    value = toString(siblings[end])

    if (value !== '/' && value !== ')') {
      end--
      nodes.pop()
    }
  }

  child = {type: 'SourceNode', value: toString(nodes)}
  initial = position.start(nodes[0])
  final = position.end(nodes[nodes.length - 1])

  if (initial.line && final.line) {
    child.position = {start: initial, end: final}
  }

  // Remove the nodes and insert a SourceNode.
  siblings.splice(start, end - start + 1, child)

  index++

  // Ignore the following full-stop: it's not part of a link.
  if (value === '.') {
    index++
  }

  return index
}

function applicable(type) {
  return type === 'WordNode' || puncOrSymbol(type)
}

function puncOrSymbol(type) {
  return type === 'PunctuationNode' || type === 'SymbolNode'
}
