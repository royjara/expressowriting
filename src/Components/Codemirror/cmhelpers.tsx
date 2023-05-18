import {
  Annotation,
  EditorSelection,
  EditorState,
  SelectionRange,
} from "@codemirror/state";
import { SearchQuery, SearchCursor } from "@codemirror/search";
import {
  L1_dict,
  dev_dict,
  dev_dict as dict_temp,
} from "../expressoDictionary";
import { Placeholder, Sidebar, db } from "../Dexie/db";
import { EditorView } from "@codemirror/view";

export interface ExtendedSearchResult {
  range: SelectionRange;
  color: string;
  triggerword: string;
  wordlocations?: { from: number; to: number }[];
  popupcontent: { title: string; content: string; showsidebar: boolean };
  sidebarcontent: Sidebar;
  placeholdercontent: {
    suggestion: string | null;
    location: number;
    replace: { from: number; to: number } | null;
  };
}

export class Searcher {
  state: EditorState;

  constructor({ state }: { state: EditorState }) {
    this.state = state;
  }

  getPHlocation(position: string, oglocation: number): number {
    let sentence_end_rgx = "[.?!]+[ ]+";
    let end_punctuation_rgx = "[.?!]+";
    var q1 = new SearchQuery({ search: sentence_end_rgx, regexp: true });
    var q2 = new SearchQuery({ search: end_punctuation_rgx, regexp: true });
    var cursor1 = q1.getCursor(this.state.doc).next() as SearchCursor;
    var cursor2 = q2.getCursor(this.state.doc).next() as SearchCursor;

    let search1 = [];
    let search2 = [];
    while (!cursor1.done) {
      search1.push(cursor1.value);
      cursor1.next();
    }
    while (!cursor2.done) {
      search2.push(cursor2.value);
      cursor2.next();
    }

    switch (position.toLowerCase()) {
      case "end":
        // get last few chars in doc
        let lastchar = this.state.doc.toString().slice(-1);
        if (lastchar === " ") {
          return this.state.doc.toString().length;
        } else {
          // TODO: prompt extension to add space --------------------------------------
          return this.state.doc.toString().length;
        }

      case "after":
        let after_idx1 = search1
          .filter((val) => val.to > oglocation)
          .map((val) => val.to);
        let after_idx2 = search2
          .filter((val) => val.to > oglocation)
          .map((val) => val.to);

        if (after_idx1.length > 0) {
          return after_idx1[0];
        } else if (after_idx2.length > 0) {
          return after_idx2[0];
        } else {
          // console.log("no space");
          return this.state.doc.toString().length;
        }
      case "before":
        let before_idx1 = search1
          .filter((val) => val.to < oglocation)
          .map((val) => val.to)
          .reverse();
        let before_idx2 = search2
          .filter((val) => val.to < oglocation)
          .map((val) => val.to)
          .reverse();
        if (before_idx1.length > 0) {
          return before_idx1[0];
        } else if (before_idx2.length > 0) {
          return before_idx2[0];
        } else {
          return 0;
        }
      default:
        break;
    }

    return 0;
  }

  searchDict(): ExtendedSearchResult[] {
    var searchresults = [] as ExtendedSearchResult[];

    dict_temp.forEach((element) => {
      let concat_word_options = element.words.concat(
        element.phrase_ext,
        element.wordnet_ext
      );
      // console.log("concat_word_options", concat_word_options);

      concat_word_options.forEach((single) => {
        var regexsearch = "\\b" + single + "\\b";
        var q = new SearchQuery({ search: regexsearch, regexp: true }); // might need to optimize here
        var cursor = q.getCursor(this.state.doc) as SearchCursor;

        while (!cursor.done) {
          // get phlocation here!
          let phlocation = cursor.value.to;
          let rewrite_contents = null as null | string;
          let replace = null as { from: number; to: number } | null;

          if (element.rewrite !== null) {
            if (element.rewrite_position.toLowerCase() === "replace") {
              // find word to replace
              replace = { from: cursor.value.from, to: cursor.value.to };
              phlocation = cursor.value.to;
            } else {
              phlocation = this.getPHlocation(
                element.rewrite_position,
                cursor.value.to
              );
            }
            rewrite_contents =
              element.rewrite[
                Math.floor(Math.random() * element.rewrite.length)
              ]; // curently pick at random. But can be tuned!
          }

          if (cursor.value.from < cursor.value.to) {
            let rgbcol = hexToRgb(element.color);
            let rgbcolstr =
              "rgba(" +
              rgbcol?.r +
              "," +
              rgbcol?.g +
              "," +
              rgbcol?.b +
              ", 0.5)";

            searchresults.push({
              range: EditorSelection.range(cursor.value.from, cursor.value.to),
              // color: element.color,
              color: rgbcolstr,
              triggerword: this.state.sliceDoc(
                cursor.value.from,
                cursor.value.to
              ),
              popupcontent: {
                title: element.popup_title!,
                content: element.popup_feedback!,
                showsidebar: element.Sidebar_feedback !== null,
              },
              sidebarcontent: {
                title: "sidebar title",
                display: false,
                content: element.Sidebar_feedback!,
                highlight: rgbcolstr,
                rephrase: element.rewrite !== null,
              },
              placeholdercontent: {
                suggestion: rewrite_contents,
                location: phlocation,
                replace: replace !== null ? replace : null,
              },
            });
          }
          cursor.next();
        }
      });
    });

    return searchresults;
  }
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export async function togglePlaceholder(
  view: EditorView,
  type: "L1" | "L3",
  prevPh: Placeholder
) {
  if (type === "L3") {
    let prevsuggestion = prevPh?.suggestion!;
    let triggerword = prevPh?.triggerword!;

    // search alternative replace based on same triggerword
    let filtereddict = dev_dict.filter((entry) =>
      entry.words.includes(triggerword.toLowerCase())
    );
    // console.log("filtered dict size", filtereddict.length);
    let possiblesuggestions = filtereddict[0].rewrite!;
    possiblesuggestions = possiblesuggestions.filter((entry) => {
      return entry === prevsuggestion ? false : true;
    });
    let newsuggestion =
      possiblesuggestions[
        Math.floor(Math.random() * possiblesuggestions.length)
      ];

    await db.placeholders.update(1, {
      active: true,
      origin: "L3",
      triggerword: triggerword,
      suggestion: newsuggestion,
      location: view.state.doc.length,
      nocook: false,
    });
    return;
  } else {
    // -------------------------------------------------------------------------------------------------- L1 options
    if (prevPh?.active === false) {
      // ------------------------------------------------------------------------------------------------ Create suggestion
      // using only words from last two lines
      let text = view.state.doc.toJSON().slice(-2);
      let lastwords = [] as string[];
      for (let i = 0; i < text.length; i++) {
        let line = text[i];
        line.split(/[.?!]+/).forEach(function (sentence) {
          if (sentence.length > 3) {
            sentence.split(" ").forEach(function (word) {
              if (word.length > 0) {
                lastwords.push(word);
              }
            });
          }
        });
      }

      let filteredwords = lastwords
        .filter(
          (word) =>
            L1_dict.filter((w) => w.Word === word.toLowerCase()).length > 0
        )
        .reverse();

      // console.log("filteredwords post dict filter", filteredwords);

      let availableoptions = [] as typeof L1_dict;
      let triggerw = null as null | string;
      if (filteredwords.length === 0) {
        // use NULL matching
        availableoptions = L1_dict.filter((entry) => entry.Word === null);
      } else {
        // use the first word in filteredwords
        availableoptions.push(
          L1_dict.find((entry) => entry.Word === filteredwords[0])!
        );
        triggerw = filteredwords[0];
      }
      console.log("availableoptions[0]", availableoptions[0]);

      if (prevPh !== undefined) {
        // update

        await db.placeholders.update(1, {
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: availableoptions[0].rewrite[0],
          location: view.state.doc.length,
          nocook: false,
        });
      } else {
        //add
        await db.placeholders.add({
          id: 1,
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: availableoptions[0].rewrite[0],
          location: view.state.doc.length,
          replace: null,
          nocook: false,
        });
      }
    } else {
      // ------------------------------------------------------------------------------------------------ toggle
      let prevsuggestion = prevPh?.suggestion!;
      let triggerw = prevPh?.triggerword;

      let availableoptions = [] as typeof L1_dict;
      let targetsuggestion: string;

      if (triggerw === null || triggerw === undefined) {
        availableoptions = L1_dict.filter((entry) => entry.Word === null);
      } else {
        availableoptions = L1_dict.filter(
          (entry) => entry.Word === triggerw!.toLowerCase()
        );
      }

      let suggestions = [] as string[];
      availableoptions.forEach((opt) => suggestions.push(...opt.rewrite));
      suggestions = suggestions.filter((val) => val !== prevsuggestion);
      // console.log("suggestionsize", suggestions.length);
      if (suggestions.length <= 1) {
        targetsuggestion = prevsuggestion;
      } else {
        targetsuggestion =
          suggestions[Math.floor(Math.random() * suggestions.length)];
      }

      // console.log("TARGET SUGGESTION ON TOGGLE", targetsuggestion);

      const res = await db.placeholders.get(1);
      if (res !== undefined) {
        // update
        await db.placeholders.update(1, {
          active: true,
          origin: "L1",
          triggerword: triggerw,
          suggestion: targetsuggestion,
          location: view.state.doc.length,
        });
      } else {
        //add
        await db.placeholders.add({
          id: 1,
          active: true,
          origin: "L1",
          triggerword: triggerw!,
          suggestion: targetsuggestion,
          location: view.state.doc.length,
          replace: null,
        });
      }
    }
  }

  return;
}

export const annotation1 = Annotation.define();
