# Expresso 📝 ☕️

Expressive writing platform for developing AI assistant writing interventions.

<br>

# Setup Development

## Prerequisites:

- Node.js

## Installing

1. `git clone ...`
2. `cd <dir>`
3. `npm install`
4. `npm start`
5. Open a web browser and go to http://localhost:3000 (default)

<br>

# Publishing

We're using surge for convenience purposes.

Installation instructions: https://surge.sh/help/getting-started-with-surge

1. Build site (necessary for optimizations) <pre> `npm run build` </pre>
2. Run surge (will need to sign in/up if first use) <pre>`surge`</pre>
3. Choose to publish the build folder: <pre>`project: <root>/expressowriting/build`</pre>
4. Choose the same domain each time <pre>`domain: expressots.surge.sh`</pre>

To remove site from public domain: <pre>`surge teardown <domain>.surge.sh`</pre>

<br>

# Project Structure

- Typescript: ensures type safety + allows for defining custom types (see `./src/Components/Dexie/db.ts`)

## Essential Node Packages

- React
- Codemirror 6
- Dexie.js

## Main Files

- Entrypoint: `src/index.tsx`
- Visual debugging via var(--borderdebug): `src/App.css`
- Main type + database definitions: `src/Components/Dexie/db.ts`
- Dictionary loading: `src/Components/expressoDitionary.ts`
- Editor: `src/Components/Codemirror/Editor.tsx`
  - See README.md inside this directory

<br>

# Pending Work

- Expresso Dictionary Version 2.0
  - Ensure format is aligned with new sidebar type (see `./src/Components/Dexie/db.ts`)
- Space alignment in editor placeholder features
- Adding CategoryLabel to popups

Bug:

- When analysis is enabled, and you type a word that will be marked at the end of the doc, if you click on that last mark, the editor will crash.
  - out of bounds selection
  - Solution resources in `./src/Components/Codemirror/README.md`

<br>

# Future Work

- Adding markdown support for more standardized content generation (for feedback sidebar and potentially other components)

  - https://mdxjs.com/
  - https://github.com/remarkjs/react-markdown

- Measure Emotion Dynamics:
  - https://arxiv.org/abs/2103.01345
  - Lexicon based implementation helps with transparency
  - Need extra care when using a publicly sourced lexicon for bias, inaccuracies, etc.
