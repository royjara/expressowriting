# Editor ✍️

### Brief Codemirror 6 Philosophy

- Functional code
- State/Doc objects are immutable.
  - CM API will prompt you to create new objects for any state or doc changes.
- If this approach is fully obeyed, codemirror bugs will stop appearing.

<br>

# Editor Structure

src/Components/Codemirror/Editor.tsx

- React Funtional Component
- **Receives App.tsx props** that will be required by the Editor \

  - currentNote
  - L2active (+ setL2active)
  - timespent (+ setTimespent) - state (for time logging of events relative to time of creation)
  - L1trigger (+setL2trigger) - for one off placeholder suggestions

- Editor states: Typescript makes these self explanatory
- Editor theme/appearance defined in line 117
- Livequeries for syncing state from dexie
  - placeholder
  - highlights
  - dismiss

<br>

### Editor loading:

1. Fetch note from dexie
2. Remake the editor (this happens on load, feature switch, etc.)
   - Set doc contents
   - Load all the extensions
   - Set editorView inside of the editorRef
3. useEffect return function will be called when component unmounts - helps avoid memory leakages.

<br>

# Expresso Extensions

## Keymaps

- Define shortcuts here
- Escape necessary for cancelling L2
  - uses annotation that is then acted on in Editor updateListener
- ctrl-space for prompting expressiveness or changing suggestions
  - calls toggleplaceholder method in cmhelpers

## L1/L3 Feature

- almost identical implementation for both L1 and L3. Trigger origin will vary.
- trigger by enabling L1active or ctrl+space shortcut
- a suggestionfacet is loaded in extension loading section
  - necessary data for prompting suggestion is posted here
- when active, placeholders plugin will be enabled

### placeholders plugin: phViewPlugin.tsx

- on constructor,
  - read settings from suggestionfacet
  - log feature enabling
  - initialize an empty replace decoration
- OnUpdate
  - if users leaves editing area (deactivate)
  - if user edits content + it matches suggestion, update placeholder to show one less character
  - if user makes a typo, increase typo counter
  - if # of backspaces = # of typos, reshow placeholder
  - if user has exceeded typo counter, finished or backspaced enough, deactivate by posting update to dexie (`db.placeholders.update(...)`)
- provide:
  - additional extensions necessary for complete functionality (e.g. decoration just adds formatting to placeholder range)
- PlaceholderWidget
  - minimal class implementation

## L2

- Also triggered by setting L2active state to true

### CookMarks.ts

- cursorTooltip is the entrypoint: invokes two extensions
  - cursorTooltipBaseTheme: styles
  - fieldmaker:
    - runs getCursortooltip on creation and when editor has been updated (needs to recompute)
    - getCursortooltip:
      - searches for words in dictionary,
      - loads all the square marks with the dom.onclick function which will load all the necessary tables with the dictionary data (popup, feedback)
- All the toggling, loading of state for popup/sidebar is done via dexie updates
  - Popup/sidebar then use the **useLiveQuery** dexie function to listen for changes.

### src/Components/UI/Popup.tsx

- uses dynamic css to show/hide

### src/Components/UI/FeedbackSidebar.tsx

- new dictionary version should provide for each entry an array of cards that will be displayed on feedback
- need this structure `{ html: string; accent: string; label: string }`
- sidebar cards can then be dismissed, expanded one at a time, etc. Allows for more digestible communication.

<br>

# Additional notes

## Fragile components/code that should be improved

1. Editor reloading approach for loading/disabling extensions should be replaced by the proper codemirror api. https://discuss.codemirror.net/t/how-update-extensions-after-creating/4064/10

   - this causes some of the selection out of range errors

2. "Pause detection" implemented via `useEffect` hook in line 89 of Editor.tsx
   - Currently works (nicely sometimes) but convoluted logic/not good practice
