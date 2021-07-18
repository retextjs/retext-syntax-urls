/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Literal<string>} Literal
 * @typedef {import('unist').Parent} Parent
 */

import fs from 'fs'
import path from 'path'
import assert from 'assert'
import test from 'tape'
import {isHidden} from 'is-hidden'
import {retext} from 'retext'
import {removePosition} from 'unist-util-remove-position'
import {visit} from 'unist-util-visit'
import retextSyntaxUrls from '../index.js'
import {correct, incorrect} from './lists.js'

const position = retext().use(retextSyntaxUrls)
const noPosition = retext()
  .use(function () {
    // @ts-expect-error: Assume attached.
    // type-coverage:ignore-next-line
    Object.assign(this.Parser.prototype, {position: false})
  })
  .use(retextSyntaxUrls)

test('retext-syntax-urls', (t) => {
  t.test('Correct URLs', (st) => {
    let index = -1
    while (++index < correct.length) {
      const url = correct[index]
      st.doesNotThrow(() => {
        const tree = position.parse('Check out ' + url + ' it’s awesome!')
        /** @type {Literal} */
        // @ts-expect-error: fine.
        const node = tree.children[0].children[0].children[4]
        assert.strictEqual(node.type, 'SourceNode', 'is a source node')
        assert.strictEqual(node.value, url, 'should have the correct value')
      }, url)
    }

    st.end()
  })

  t.test('Incorrect URLs', (st) => {
    let index = -1
    while (++index < incorrect.length) {
      const url = incorrect[index]

      st.doesNotThrow(() => {
        const tree = position.parse('Check out ' + url + ' it’s bad!')

        visit(tree, 'SourceNode', (/** @type {Literal} */ node) => {
          throw new Error('Found a source node for `' + node.value + '`')
        })
      }, url)
    }

    st.end()
  })

  t.end()
})

test('fixtures', (t) => {
  const root = path.join('test', 'fixtures')
  const files = fs.readdirSync(root)
  let index = -1

  while (++index < files.length) {
    const name = files[index]

    if (isHidden(name)) continue

    const input = fs.readFileSync(path.join(root, name, 'input.txt'))
    /** @type {Node} */
    const base = JSON.parse(
      String(fs.readFileSync(path.join(root, name, 'output.json')))
    )

    t.deepLooseEqual(position.parse(input), base, name + ' w/ position')
    t.deepLooseEqual(
      noPosition.parse(input),
      removePosition(base, true),
      name + ' w/o position'
    )
  }

  t.end()
})
