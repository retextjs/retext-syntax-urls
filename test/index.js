import fs from 'fs'
import path from 'path'
import assert from 'assert'
import test from 'tape'
import not from 'not'
import hidden from 'is-hidden'
import retext from 'retext'
import clean from 'unist-util-remove-position'
import visit from 'unist-util-visit'
import urls from '../index.js'
import {correct, incorrect} from './lists.js'

var position = retext().use(urls)
var noPosition = retext().use(off).use(urls)

function off() {
  this.Parser.prototype.position = false
}

test('retext-syntax-urls', function (t) {
  t.test('Correct URLs', function (st) {
    let index = -1
    while (++index < correct.length) {
      const url = correct[index]
      st.doesNotThrow(function () {
        var tree = position.parse('Check out ' + url + ' it’s awesome!')
        var node = tree.children[0].children[0].children[4]
        assert.strictEqual(node.type, 'SourceNode', 'is a source node')
        assert.strictEqual(node.value, url, 'should have the correct value')
      }, url)
    }

    st.end()
  })

  t.test('Incorrect URLs', function (st) {
    let index = -1
    while (++index < incorrect.length) {
      const url = incorrect[index]

      st.doesNotThrow(function () {
        var tree = position.parse('Check out ' + url + ' it’s bad!')

        visit(tree, 'SourceNode', found)

        function found(node) {
          throw new Error('Found a source node for `' + node.value + '`')
        }
      }, url)
    }

    st.end()
  })

  t.end()
})

test('fixtures', function (t) {
  var root = path.join('test', 'fixtures')
  const files = fs.readdirSync(root).filter(not(hidden))
  let index = -1

  while (++index < files.length) {
    const name = files[index]
    var input = fs.readFileSync(path.join(root, name, 'input.txt'))
    var base = JSON.parse(fs.readFileSync(path.join(root, name, 'output.json')))

    t.deepLooseEqual(position.parse(input), base, name + ' w/ position')
    t.deepLooseEqual(
      noPosition.parse(input),
      clean(base, true),
      name + ' w/o position'
    )
  }

  t.end()
})
