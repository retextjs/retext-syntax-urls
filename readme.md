# retext-syntax-urls

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**retext**][retext] plugin to classify url-like values (`example.com`,
`index.html`, `www.alpha.bravo`) as [syntax][source], not natural language.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install retext-syntax-urls
```

## Use

Without `syntax-urls`:

```js
import dictionary from 'dictionary-en-gb'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import retextSpell from 'retext-spell'
import retextSyntaxUrls from 'retext-syntax-urls'
import retextStringify from 'retext-stringify'

unified()
  .use(retextEnglish)
  .use(retextSpell, dictionary)
  .use(retextStringify)
  .process('Have you read readme.md? Check it out: www.example.com/readme.md')
  .then((file) => {
    console.log(reporter(file))
  })
```

Yields:

```txt
  1:15-1:24  warning  `readme.md` is misspelt        retext-spell  retext-spell
  1:40-1:55  warning  `www.example.com` is misspelt  retext-spell  retext-spell
  1:56-1:65  warning  `readme.md` is misspelt        retext-spell  retext-spell

⚠ 3 warnings
```

With `syntax-urls`:

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

Classify URLs, paths, and filenames as [**source**][source], which represent
“external (ungrammatical) values” instead of natural language.
This hides them from [`retext-spell`][spell],
[`retext-readability`][readability], [`retext-equality`][equality], and more.

## Related

*   [`retext-syntax-mentions`][syntax-mentions]
    — Classify [**@mentions**](https://github.com/blog/821) as syntax
*   [`retext-spell`][spell]
    — Check spelling
*   [`retext-readability`][readability]
    — Check readability
*   [`retext-equality`][equality]
    — Check possible insensitive, inconsiderate language

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

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/retextjs/.github/blob/HEAD/support.md

[coc]: https://github.com/retextjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[retext]: https://github.com/retextjs/retext

[source]: https://github.com/syntax-tree/nlcst#source

[spell]: https://github.com/retextjs/retext-spell

[readability]: https://github.com/retextjs/retext-readability

[equality]: https://github.com/retextjs/retext-equality

[syntax-mentions]: https://github.com/retextjs/retext-syntax-mentions
