import { EditorView, keymap } from "@codemirror/view";
import { db } from "../Dexie/db";
import { annotation1, togglePlaceholder } from "./cmhelpers";

export const keymaps = keymap.of([
  {
    key: "Escape",
    preventDefault: true,
    run: (view) => {
      db.placeholders.update(1, {
        active: false,
        origin: "L1",
        triggerword: null,
        replace: null,
      });
      view.dispatch({ annotations: annotation1.of("esc") });
      return true;
    },
  },
  {
    key: "Ctrl-Space",
    preventDefault: true,
    run: (view: EditorView) => {
      // check if L1 or L3
      let current = db.placeholders.get(1).then((res) => {
        if (res?.origin === "L3") {
          // console.log("ctrl space on l3");
          togglePlaceholder(view, "L3", res);
        } else {
          // console.log("ctrl space on l1");
          togglePlaceholder(view, "L1", res!);
        }
      });
      setTimeout(() => db.placeholders.update(1, { active: true }), 10);
      return true;
    },
  },
]);
