/**
 * reference: https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/
 *            https://codesandbox.io/s/codemirror6-t9ywwc?file=/src/index.js && https://discuss.codemirror.net/t/how-to-listen-to-changes-for-react-controlled-component/4506/4
 *
 *
 */

import React, { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

import { annotation1, keymaps, togglePlaceholder } from "./keymaps";
import { db, DismissLog, Highlight, Note, Placeholder } from "../Dexie/db";
import { IndexableType } from "dexie";

import "../Styles/Editor.css";
import { cursorTooltip } from "./Extensions/CookMarks";

import { history } from "@codemirror/commands";

import { toggleWith, toggleWith2 } from "./Extensions/toggleWith";
import { metadatafacet, suggestionfacet } from "./Extensions/facets";

import { placeholders } from "./Extensions/phViewPlugin";
import { useLiveQuery } from "dexie-react-hooks";
import { debounce } from "lodash";
import { timeChecker } from "./Extensions/checkPauses";
import { l2underline } from "./Extensions/textMarker";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";

interface editorProps {
  view: EditorView | null;
  setView: React.Dispatch<React.SetStateAction<EditorView | null>>;
  currentNote: number | null;
  L2active: boolean;
  // L1active: boolean;
  // setL1active: React.Dispatch<React.SetStateAction<boolean>>;
  setL2active: React.Dispatch<React.SetStateAction<boolean>>;
  timespent: number;
  setTimespent: React.Dispatch<React.SetStateAction<number>>;
  L1trigger: boolean;
  setL1trigger: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Editor({
  view,
  setView,
  currentNote,
  L2active,
  // L1active,
  // setL1active,
  setL2active,
  timespent,
  setTimespent,
  L1trigger,
  setL1trigger,
}: editorProps) {
  const editorRef = useRef<HTMLElement>(null);
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
  const [tim, setTim] = useState(0);

  const [L1active, setL1active] = useState<boolean>(false);

  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [deltaChanges, setDeltaChanges] = useState<number>(0);

  useEffect(() => {
    if (!timerEnabled) {
      setTimerEnabled(true);
    }
  }, [L1active]);

  useEffect(() => {
    // If cursor not at end of document - turn off timer
    if (view !== null) {
      if (cursor !== view.state.toJSON().doc.length) {
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
      setTimerEnabled(true);
      let x = window.setTimeout(() => {
        setTimeout(() => {
          setL1trigger(false);
        }, 2);
        setL1trigger(true);
        setTimerEnabled(false);
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
        setTimerEnabled(false);
      });
    }
  }, [L1trigger]);

  useEffect(() => {
    if (suggestion?.nocook) {
      return;
    }

    // spacetester(fetchedNote?.content!);

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

  function getCursorLocation() {
    if (placeholderActive) {
      console.log("setting cursor to: ", suggestion!.location);
      return suggestion!.location;
    } else {
      return cursor;
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

  // function spacetester(content: string) {
  //   let needspace = content.charAt(suggestion?.location! - 1) !== "*";
  //   console.log("needspace", needspace);
  //   let newcontent =
  //     content.slice(0, suggestion?.location!) +
  //     "*" +
  //     content.slice(suggestion?.location!);

  //   console.log("new target cursor:", suggestion?.location! + 1);
  //   if (needspace) {
  //     setSuggestion({
  //       ...suggestion!,
  //       location: suggestion?.location! + 1,
  //       nocook: true,
  //     });
  //     return newcontent;
  //   } else {
  //     return content;
  //   }
  // }

  // 2. After contents have loaded, remake the editor
  React.useEffect(() => {
    if (editorRef.current === null) return;
    if (fetchedNote === undefined) return;

    setTitle(fetchedNote?.title);

    const state = EditorState.create({
      // doc: placeholderActive ? spacetester(fetchedNote?.content): fetchedNote?.content,
      doc: fetchedNote?.content,
      selection: {
        anchor: getCursorLocation(),
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
        placeholderActive
          ? suggestionfacet.of({
              target: suggestion!.suggestion,
              from: suggestion!.location,
              to: suggestion!.suggestion.length,
              replace: suggestion!.replace,
              origin: suggestion!.origin,
            })
          : [],

        // display ph
        placeholderActive ? placeholders : [],

        // onchange listener ------------------------------------------------
        EditorView.updateListener.of(({ state, view, transactions }) => {
          // console.log("in update listener");
          console.log("suggestion facet: ", view.state.facet(suggestionfacet));

          transactions.forEach((tr) => {
            if (tr.docChanged) {
              setDeltaChanges(deltaChanges + 1);
            }
            if (tr.annotation(annotation1) === "esc") {
              // setL2active(false);
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
  }, [fetchedNote, dismisslist]);

  function handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
    let newtitle: string = (e.target as HTMLInputElement).value;
    setTitle(newtitle);
    saveTitle(newtitle);
  }

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
    <div
      style={{
        margin: "0 22vw 10px 30px",
        width: "auto",
        height: "90%",
      }}
    >
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
          {/* <p>Cursor: {cursor}</p> */}
          <p>{showSave ? "Saving" : ""}</p>
          {/* <Saver deltachange={deltaChanges} /> */}
          {/* <StopWatch start={timerEnabled} time={time} setTime={setTime} /> */}
          {/* <button
            onClick={() => {
              setTimerEnabled(!timerEnabled);
            }}
          >
            Stopwatch {timerEnabled ? "on" : "off"}
          </button> */}
          {/* <p>{keydownRate} kpm</p> */}
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
                      // setTimerEnabled(true);
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
          // border: "5px solid var(--highlight2)",
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
