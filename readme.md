# retext-syntax-urls

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[retext][]** plugin to classify URL-like values as syntax instead of natural
language.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(retextSyntaxUrls)`](#unifieduseretextsyntaxurls)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([retext][]) plugin to classify URL-like values
(such as `example.com`, `index.html`, or `www.alpha.bravo`) as
[`SourceNode`][source] instead of natural language.
That node represent “external (ungrammatical) values” instead of natural
language, which hides URLs and paths from [`retext-spell`][retext-spell],
[`retext-readability`][retext-readability],
[`retext-equality`][retext-equality], and other things that check words.

## When should I use this?

You can use this plugin any time there are URLs and paths in prose, that are
(incorrectly) warned about by linting plugins.

> **Note**: this is not a markdown parser.
> Use `unified` with [`remark-parse`][remark-parse] and
> [`remark-retext`][remark-retext] to “hide” other syntax.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install retext-syntax-urls
```

In Deno with [`esm.sh`][esmsh]:

```js
import retextSyntaxUrls from 'https://esm.sh/retext-syntax-urls@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import retextSyntaxUrls from 'https://esm.sh/retext-syntax-urls@3?bundle'
</script>
```

## Use

Without `retext-syntax-urls`:

```js
import dictionary from 'dictionary-en-gb'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import retextSpell from 'retext-spell'
import retextSyntaxUrls from 'retext-syntax-urls'
import retextStringify from 'retext-stringify'

const file = await unified()
  .use(retextEnglish)
  .use(retextSpell, dictionary)
  .use(retextStringify)
  .process('Have you read readme.md? Check it out: www.example.com/readme.md')

console.log(reporter(file))
```

Yields:

```txt
  1:15-1:24  warning  `readme.md` is misspelt        retext-spell  retext-spell
  1:40-1:55  warning  `www.example.com` is misspelt  retext-spell  retext-spell
  1:56-1:65  warning  `readme.md` is misspelt        retext-spell  retext-spell

⚠ 3 warnings
```

With `retext-syntax-urls`:

```diff
   .use(retextEnglish)
+  .use(retextSyntaxUrls)
   .use(retextSpell, dictionary)
```

Yields:

```txt
no issues found
```

## API

This package exports no identifiers.
The default export is `retextSyntaxUrls`.

### `unified().use(retextSyntaxUrls)`

Classify URL-like values as syntax instead of natural language.

There are no options.

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`retext-syntax-mentions`][retext-syntax-mentions]
    — classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-spell`][retext-spell]
    — check spelling
*   [`retext-readability`][retext-readability]
    — check readability
*   [`retext-equality`][retext-equality]
    — check possible insensitive, inconsiderate language

## Contribute

See [`contributing.md`][contributing] in [`retextjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/retextjs/retext-syntax-urls/workflows/main/badge.svg

[build]: https://github.com/retextjs/retext-syntax-urls/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-syntax-urls.svg

[coverage]: https://codecov.io/github/retextjs/retext-syntax-urls

[downloads-badge]: https://img.shields.io/npm/dm/retext-syntax-urls.svg

[downloads]: https://www.npmjs.com/package/retext-syntax-urls

[size-badge]: https://img.shields.io/bundlephobia/minzip/retext-syntax-urls.svg

[size]: https://bundlephobia.com/result?p=retext-syntax-urls

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/retextjs/retext/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/main/contributing.md

[support]: https://github.com/retextjs/.github/blob/main/support.md

[coc]: https://github.com/retextjs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[unified]: https://github.com/unifiedjs/unified

[retext]: https://github.com/retextjs/retext

[source]: https://github.com/syntax-tree/nlcst#source

[remark-parse]: https://github.com/remarkjs/remark/tree/main/packages/remark-parse

[remark-retext]: https://github.com/remarkjs/remark-retext

[retext-spell]: https://github.com/retextjs/retext-spell

[retext-readability]: https://github.com/retextjs/retext-readability

[retext-equality]: https://github.com/retextjs/retext-equality

[retext-syntax-mentions]: https://github.com/retextjs/retext-syntax-mentions
