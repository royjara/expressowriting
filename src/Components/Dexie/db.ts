import Dexie, { Table } from "dexie";
import "dexie-export-import";
import download from "downloadjs";

// export interface UserReminders {
//   id?: number;
//   onboard: boolean;
//   disclaimer: boolean;
//   completion: boolean;
// }
export interface Note {
  id?: number;
  title: string;
  content: string;
  creationdate: number;
  lastedit: number;
  timeduration: number;
  stats: {};
}

interface NoteSnapshots {
  id?: number;
  note: number;
  wordcount: number;
  realtime: number;
  timestamp: number;
  dismisslist: { word: string; pos: { from: number; to: number } }[];
  reframecount: number;
  expressivenesscount: number;
  feedbackusetime: number;
}

export interface DismissLog {
  id?: number;
  note: number;
  word: string;
  timestamp: number;
  realtime: number;
  pos: { from: number; to: number };
}

export interface Highlight {
  id?: number;
  pos: { from: number; to: number };
  active: boolean;
  color: string | null;
}

export interface Timelog {
  id?: number;
  note: number;
  pause: number | null;
  timestep: number;
}

export interface Logs {
  id?: number;
  note: number;
  realtime: number;
  timestamp: number;
  feature:
    | "noteopen"
    | "L1autoexpressiveness"
    | "L1singleexpressiveness"
    | "L2autoanalysis"
    | "L2popup"
    | "L2sidebar"
    | "L3rephrase";
  featurestate?: "enable" | "dismiss" | "complete" | "disable" | "toggle";
  comments?: any | null;
}

export interface Sidebar {
  id?: number;
  title: string;
  content: { html: string; accent: string; label: string; }[];
  highlight: string;
  // content: string | string[];
  display: boolean;
  rephrase: boolean;
}
export interface Popup {
  id?: number;
  title: string;
  content: string;
  display: boolean;
  triggerword: string;
  wordlocation: { from: number; to: number };
  location: { x: number; y: number };
  showsidebar: boolean;
  color: string | null;
}

export interface Placeholder {
  id?: number;
  origin: "L1" | "L3";
  triggerword: string | null;
  active: boolean;
  suggestion: string;
  location: number;
  replace: { from: number; to: number } | null;
  nocook?: boolean;
}

export class MySubClassedDexie extends Dexie {
  notes!: Table<Note>;
  sidebars!: Table<Sidebar>;
  popups!: Table<Popup>;
  placeholders!: Table<Placeholder>;
  timelogs!: Table<Timelog>;
  logs!: Table<Logs>;
  highlights!: Table<Highlight>;
  snapshots!: Table<NoteSnapshots>;
  dismiss!: Table<DismissLog>;

  constructor() {
    super("myDatabase");
    this.version(4).stores({
      notes: "++id, title, content, creationdate, timeduration, stats",
    });
    this.version(5).stores({
      sidebars: "++id, title, content, display",
      popups: "++id, title, content, display, location",
    });
    this.version(7).stores({
      placeholders: "++id, active, suggestion",
    });
    this.version(8).stores({
      timelogs: "++id, note, pause, timestep",
    });
    this.version(9).stores({
      logs: "++id, note, timestamp, feature",
    });
    this.version(10).stores({
      highlights: "++id",
    });
    this.version(11).stores({
      snapshots: "++id, note",
    });
    this.version(12).stores({
      dismiss: "++id, note",
    });
  }
}

export const db = new MySubClassedDexie();

export const downloadDB = async () => {
  try {
    const blob = await db.export({ prettyJson: true });
    download(blob, "expresso+logs.json", "application/json");
  } catch (error) {
    console.error("" + error);
  }
};
export const downloadDBlite = async () => {
  try {
    const notes = (await db.notes.toArray()).map((note: Note) => ({
      ...note,
      content: "",
      nwords: note.content.split(" ").length - 1,
    }));

    const blob = await db.export({
      prettyJson: true,
      filter: (table, value, key) => {
        if (table === "notes") {
          return false;
        }
        return true;
      },
    });

    const concatBlob = new Blob([blob, JSON.stringify(notes, null, 2)]);

    download(concatBlob, "expresso+litelogs.json", "application/json");
  } catch (error) {
    console.error("" + error);
  }
};
