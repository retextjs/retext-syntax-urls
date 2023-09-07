/**
 * @typedef {import('nlcst').Root} Root
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {isHidden} from 'is-hidden'
import {retext} from 'retext'
import {removePosition} from 'unist-util-remove-position'
import {visit} from 'unist-util-visit'
import retextSyntaxUrls from '../index.js'
import {correct, incorrect} from './lists.js'

const processor = retext().use(retextSyntaxUrls)

test('retext-syntax-urls', async function (t) {
  await t.test('should work (correct urls)', async function (t) {
    let index = -1

    while (++index < correct.length) {
      const url = correct[index]

      await t.test(url, async function () {
        const tree = processor.parse('Check out ' + url + ' it’s awesome!')
        const paragraph = tree.children[0]
        assert(paragraph?.type === 'ParagraphNode')
        const sentence = paragraph.children[0]
        assert(sentence?.type === 'SentenceNode')
        const source = sentence.children[4]
        assert(source?.type === 'SourceNode')
        assert.equal(source.value, url)
      })
    }
  })

  await t.test('should work (incorrect urls)', async function (t) {
    let index = -1

    while (++index < incorrect.length) {
      const url = incorrect[index]

      await t.test(url, async function () {
        const tree = processor.parse('Check out ' + url + ' it’s bad!')
        visit(tree, 'SourceNode', (node) => {
          throw new Error('Found a source node for `' + node.value + '`')
        })
      })
    }
  })

  await t.test('should support a sentence followed by eof', async function () {
    const tree = processor.parse('More.')

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'RootNode',
      children: [
        {
          type: 'ParagraphNode',
          children: [
            {
              type: 'SentenceNode',
              children: [
                {
                  type: 'WordNode',
                  children: [{type: 'TextNode', value: 'More'}]
                },
                {type: 'PunctuationNode', value: '.'}
              ]
            }
          ]
        }
      ]
    })
  })
})

test('fixtures', async function (t) {
  const root = new URL('fixtures/', import.meta.url)
  const folders = await fs.readdir(root)
  let index = -1

  while (++index < folders.length) {
    const folder = folders[index]

    if (isHidden(folder)) continue

    await t.test(folder, async function () {
      const folderUrl = new URL(folder + '/', root)
      const input = await fs.readFile(new URL('input.txt', folderUrl))
      /** @type {Root} */
      const base = JSON.parse(
        String(await fs.readFile(new URL('output.json', folderUrl)))
      )

      assert.deepEqual(processor.parse(input), base)
    })
  }
})
