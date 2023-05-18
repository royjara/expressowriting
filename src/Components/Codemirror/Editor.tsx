/**
 * reference: https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/
 *            https://codesandbox.io/s/codemirror6-t9ywwc?file=/src/index.js && https://discuss.codemirror.net/t/how-to-listen-to-changes-for-react-controlled-component/4506/4
 *
 *
 * Editor --------------------------------------------------------------------
 *
 * This is the bulk of the project.
 * There were some challenges that arose by using codemirror 6 + react.
 *
 * Need to understand codemirror workflow.
 *
 * In essence the extensions provide most if not all of the functionality.
 *
 *
 */

// Base for note editing in react
import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { history } from "@codemirror/commands";

// Expresso features
import { keymaps } from "./keymaps";
import { annotation1, togglePlaceholder } from "./cmhelpers";
import { cursorTooltip } from "./Extensions/CookMarks";
import { toggleWith, toggleWith2 } from "./Extensions/toggleWith";
import { metadatafacet, suggestionfacet } from "./Extensions/facets";
import { placeholders } from "./Extensions/phViewPlugin";
import { timeChecker } from "./Extensions/checkPauses";
import { l2underline } from "./Extensions/textMarker";

// For interacting with database + db types
import { db, DismissLog, Highlight, Note, Placeholder } from "../Dexie/db";
import { IndexableType } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// extras
import { debounce } from "lodash";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";

import "../Styles/Editor.css";

interface editorProps {
  currentNote: number | null;
  L2active: boolean;
  setL2active: React.Dispatch<React.SetStateAction<boolean>>;
  timespent: number;
  setTimespent: React.Dispatch<React.SetStateAction<number>>;
  L1trigger: boolean;
  setL1trigger: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Editor({
  currentNote,
  L2active,
  setL2active,
  timespent,
  setTimespent,
  L1trigger,
  setL1trigger,
}: editorProps) {
  /* Creates a reference to an HTML element using the `useRef` hook provided by React. Reference 
  initialized to null. The `useRef` hook is used to create a mutable reference to an
  element in the DOM.*/
  const editorRef = useRef<HTMLElement>(null);
  const [view, setView] = useState<EditorView | null>(null);

  const [fetchedNote, setfetchedNote] = useState<Note | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [showSave, setShowSave] = useState<boolean>(false);

  //placeholderstuff
  const [suggestion, setSuggestion] = useState<Placeholder | null>(null);
  const [placeholderActive, setPlaceholderActive] = useState<boolean>(false);
  const [wordcount, setWordcount] = useState<number>(0);

  // persist through editor reconfig
  const [cursor, setCursor] = useState<number>(0);
  const [highlight, setHighlight] = useState<Highlight | null>(null);

  const [dismisslist, setDismisslist] = useState<DismissLog[] | null>(null);
  const [tim, setTim] = useState(0); // meant for better timekeeping for pause sensing

  const [L1active, setL1active] = useState<boolean>(false);

  /* useEffect triggered whenever `cursor` changes. It checks that there is no `placeholder` and that periodic L1 suggestions
     are enabled. Since roughly cursorchange == activity (so user has not paused), we reset the timeout that will trigger a new suggestion. */
  useEffect(() => {
    console.log("cursor", cursor);
    if (view !== null) {
      // If cursor not at end of document - turn off timer
      if (cursor !== view.state.toJSON().doc.length) {
        // If timer doesn't exist, just return.
        if (tim !== 0) {
          window.clearTimeout(tim);
        }
        return;
      }
    }
    if (!placeholderActive && L1active) {
      if (tim !== 0) {
        window.clearTimeout(tim);
      }
      // Double timeout: 1st will be triggered after 7 seconds, triggering L1 suggestion
      // inner timeout will be triggered 2ms after to reset the state back to false.
      let x = window.setTimeout(() => {
        setTimeout(() => {
          setL1trigger(false);
        }, 2);
        setL1trigger(true);
      }, 7000);
      setTim(x);
    }
  }, [cursor]);

  let myTheme = EditorView.theme(
    {
      "&": {
        color: "rgba(1,1,1,0.9)",
        width: "64vw",
        // height: "100%",
        height: "calc(100vh - 160px)",
        textAlign: "left",
        overflowY: "scroll",
        // -ms-overflow-style: none;  /* IE and Edge */
        scrollbarWidth: "none",
        borderRadius: "2px",
      },
      "&.cm-editor": {
        scrollbarWidth: "none",
        // border: "2px solid orange",
        boxShadow: "rgba(0, 0, 0, 0.10) 0px 3px 8px",
        padding: "20px",
      },
      "&.cm-editor.cm-focused": {
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        // border: "2px solid blue",
        outline: "none",
      },
      ".cm-content": {
        // caretColor: "#f00",
        fontFamily: "'Inter', sans-serif",
        fontSize: "18px",
      },
      "&.cm-focused .cm-cursor": {
        border: "1px solid var(--fontcollight)",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        // backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bgcolmid)",
        color: "var(--bgcolshadow)",
      },
      ".cm-atomic": {
        // backgroundColor: "cornsilk",
      },
      ".cm-replace": {
        backgroundColor: "pink",
        textDecoration: "line-through",
      },

      ".cm-underline": {
        // textDecoration: "underline 3px var(--analysis-highlight)",
        cursor: "pointer",
        backgroundColor: "var(--analysis-highlight)",
      },
    },
    { dark: false }
  );

  const fetchNote = async () => {
    if (currentNote === null) return;
    var response = await db.notes.get(currentNote!);
    if (response !== undefined) {
      setfetchedNote(response);
      setTimespent(response.timeduration);
      if (cursor > response.content.length) {
        setCursor(response.content.length);
      }
    }
  };

  // sync state with dexie tables
  useLiveQuery(async () => {
    const res = await db.placeholders.get(1);
    if (res !== undefined) {
      setSuggestion(res);
      setPlaceholderActive(res.active);
    }
  });
  useLiveQuery(async () => {
    const res = await db.highlights.get(1);
    if (res !== undefined) {
      setHighlight(res);
    }
  });
  useLiveQuery(async () => {
    const res = await db.dismiss.where("note").equals(currentNote!).toArray();
    if (res !== undefined) {
      setDismisslist(res);
    }
  });

  // use for BOTH SINGLE AND AUTO expressiveness triggers
  useEffect(() => {
    if (L1trigger && view !== null) {
      db.placeholders.get(1).then((res) => {
        togglePlaceholder(view, "L1", res!);
      });
    }
  }, [L1trigger]);

  /* Use nocook flag to avoid infinite looping.
     Effect is used to log new suggestions.
  */
  useEffect(() => {
    if (suggestion?.nocook) {
      return;
    }

    if (suggestion !== null) {
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature:
          suggestion.origin === "L1" ? "L1singleexpressiveness" : "L3rephrase",
        featurestate: "toggle",
        comments: `new suggestion ${suggestion.suggestion}`,
      });

      setSuggestion({ ...suggestion, nocook: true });
    }
  }, [suggestion]);

  useEffect(() => {
    if (L2active) {
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2autoanalysis",
        featurestate: "enable",
        comments: null,
      });
    } else {
      db.highlights.update(1, { active: false });
      db.logs.add({
        note: fetchedNote?.id!,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "L2autoanalysis",
        featurestate: "disable",
        comments: null,
      });
    }
  }, [L2active]);

  // IMPORTANT NOTE: This function sometimes gives out of range errors.
  function getCursorLocation(content: string) {
    console.log("in getcursorlocation");
    console.log("setting cursor to: ", suggestion?.location);
    if (placeholderActive) {
      console.log("setting cursor to: ", suggestion!.location);
      return suggestion!.location;
    } else {
      return content.length;
    }
  }

  // 1. Fetch contents
  React.useEffect(() => {
    if (suggestion?.nocook) {
      return;
    }
    fetchNote().catch(console.error);
  }, [placeholderActive, suggestion, L2active, highlight]);
  React.useEffect(() => {
    fetchNote().catch(console.error);
    setPlaceholderActive(false);
    setL1active(false);
    setL2active(false);
    setHighlight(null);
    db.highlights.update(1, { active: false });
  }, [currentNote]);

  // 2. After contents have loaded, remake the editor
  React.useEffect(() => {
    if (editorRef.current === null) return;
    if (fetchedNote === undefined) return;

    setTitle(fetchedNote?.title);

    const state = EditorState.create({
      doc: fetchedNote?.content,
      selection: {
        anchor: getCursorLocation(fetchedNote?.content),
        // anchor: 0,
      },
      extensions: [
        // base ------------------------------------------------------------
        myTheme,
        history(),
        EditorView.lineWrapping,

        // custom for expresso ------------------------------------------------
        timeChecker(fetchedNote, setTimespent),
        metadatafacet.of({ noteid: fetchedNote?.id!, timeduration: timespent }),

        L2active
          ? toggleWith2("Mod-o", cursorTooltip(dismisslist!), setL2active)
          : toggleWith("Mod-o", cursorTooltip(dismisslist!), setL2active), // toggles marks

        L2active && highlight?.active ? [l2underline(highlight)] : [],

        keymaps,

        // if placholder is toggled post suggestion to facet
        placeholderActive
          ? suggestionfacet.of({
              target: suggestion!.suggestion,
              from: suggestion!.location,
              to: suggestion!.suggestion.length,
              replace: suggestion!.replace,
              origin: suggestion!.origin,
            })
          : [],

        // suggestionfacet will be picked up in placeholders class plugin
        placeholderActive ? placeholders : [],

        // onchange listener ------------------------------------------------
        EditorView.updateListener.of(({ state, view, transactions }) => {
          // console.log("suggestion facet: ", view.state.facet(suggestionfacet));

          transactions.forEach((tr) => {
            if (tr.annotation(annotation1) === "esc") {
              setL2active(false);
            }
          });

          let nwords = state.doc.toJSON().join("").split(" ").length - 1;
          setWordcount(nwords);
          setCursor(state.selection.ranges[0].to);
          saveNoteContents(state.doc.toString());
        }),
      ],
    });

    const view = new EditorView({
      state: state,
      parent: editorRef.current,
    });

    view.focus();

    setView(view);

    return () => {
      view.destroy();
      setView(null);
    };
  }, [fetchedNote, dismisslist, L2active, highlight]);

  function handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
    let newtitle: string = (e.target as HTMLInputElement).value;
    setTitle(newtitle);
    saveTitle(newtitle);
  }

  // There is an issue with using debounce on doc save.
  // If remaking the editor(e.g.reloading extension), and editor hasn't saved latest changes,
  // the old content will be reloaded and any current state will most likely be wrong.

  // const saveNoteContents = debounce(async (notetext: string) => {
  //   await db.notes.update(currentNote! as IndexableType, {
  //     content: notetext,
  //     lastedit: Date.now(),
  //   });
  //   setShowSave(true);
  // }, 1000);

  const saveNoteContents = async (notetext: string) => {
    await db.notes.update(currentNote! as IndexableType, {
      content: notetext,
      lastedit: Date.now(),
    });
    setShowSave(true);
  };

  const saveTitle = debounce(async (newtitle: string) => {
    await db.notes.update(currentNote! as IndexableType, { title: newtitle });
  }, 1000);

  useEffect(() => {
    if (showSave) {
      setTimeout(() => {
        setShowSave(false);
      }, 1000);
    }
  }, [showSave]);

  return (
    <div className="EditorContainer">
      <div className="note-header">
        <div className="notifiers">
          <p className="note-date">
            {fetchedNote === undefined
              ? ""
              : new Date(fetchedNote?.creationdate)
                  .toLocaleString("en-US")
                  .split(",")[0]}
          </p>
          <p>{wordcount} words</p>
          <p>{Math.floor(timespent / 60000)} minutes</p>
          <p>{showSave ? "Saving" : ""}</p>
          {/* FOR DEBUGGING:  ----------------- */}
          {/* <p>Cursor: {cursor}</p> */}
        </div>
        <div className="headerrow">
          <input
            className="note-title"
            value={title}
            onChange={async (e) => {
              handleTitleChange(e);
            }}
          />
          <div className="featuretoggles">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={L1active}
                    onChange={(event, checked) => {
                      setL1active(checked);
                    }}
                  />
                }
                label="Expresso"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={L2active}
                    onChange={(event, checked) => {
                      setL2active(checked);
                    }}
                  />
                }
                label="Analysis"
              />
            </FormGroup>
          </div>
        </div>
      </div>
      <section
        ref={editorRef}
        style={{
          width: "100%",
          height: "100%",
          WebkitBoxSizing: "border-box" /* Safari/Chrome, other WebKit */,
          // -moz-box-sizing: border-box;    /* Firefox, other Gecko */
          boxSizing: "border-box" /* Opera/IE 8+ */,
        }}
      />
    </div>
  );
}
