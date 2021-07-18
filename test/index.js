'use strict'

var fs = require('fs')
var path = require('path')
var assert = require('assert')
var test = require('tape')
var not = require('not')
var hidden = require('is-hidden')
var retext = require('retext')
var clean = require('unist-util-remove-position')
var visit = require('unist-util-visit')
var urls = require('..')
var lists = require('./lists.js')

var position = retext().use(urls)
var noPosition = retext().use(off).use(urls)

function off() {
  this.Parser.prototype.position = false
}

test('retext-syntax-urls', function (t) {
  t.test('Correct URLs', function (st) {
    lists.correct.forEach(check)

    st.end()

    function check(url) {
      st.doesNotThrow(function () {
        var tree = position.parse('Check out ' + url + ' it’s awesome!')
        var node = tree.children[0].children[0].children[4]
        assert.strictEqual(node.type, 'SourceNode', 'is a source node')
        assert.strictEqual(node.value, url, 'should have the correct value')
      }, url)
    }
  })

  t.test('Incorrect URLs', function (st) {
    lists.incorrect.forEach(check)

    st.end()

    function check(url) {
      st.doesNotThrow(function () {
        var tree = position.parse('Check out ' + url + ' it’s bad!')

        visit(tree, 'SourceNode', found)

        function found(node) {
          throw new Error('Found a source node for `' + node.value + '`')
        }
      }, url)
    }
  })

  t.end()
})

test('fixtures', function (t) {
  var root = path.join('test', 'fixtures')

  fs.readdirSync(root).filter(not(hidden)).forEach(check)

  t.end()

  function check(name) {
    var input = fs.readFileSync(path.join(root, name, 'input.txt'))
    var base = JSON.parse(fs.readFileSync(path.join(root, name, 'output.json')))

    t.deepLooseEqual(position.parse(input), base, name + ' w/ position')
    t.deepLooseEqual(
      noPosition.parse(input),
      clean(base, true),
      name + ' w/o position'
    )
  }
})
