/**
 * App.tsx - Entrypoint
 *
 * Journaling web application for mental health.
 * Levels of intervention (L1, L2, L3) are implemented as text editing + UI features.
 *
 */

import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import { db } from "./Components/Dexie/db";

// most of the work is here
import { Editor } from "./Components/Codemirror/Editor";

import ReactModal from "react-modal";

import Tabs from "./Components/UI/Landing/Tabs";
import Menu from "./Components/UI/Menu/Menu";
import Popup from "./Components/UI/Popup";
import FeedbackSidebar from "./Components/UI/FeedbackSidebar";
import GraphBuilder from "./Components/Graphics/GraphBuilder";
import FAQ from "./Components/UI/Menu/FAQ";
import Welcome from "./Components/UI/Landing/Welcome";
import Onboarding from "./Components/UI/Landing/Onboarding";

import "./App.css";

type TabsType = {
  label: string;
  index: number;
  Component: React.FC<{}>;
}[];

const tabs: TabsType = [
  {
    label: "Welcome",
    index: 1,
    Component: Welcome,
  },
  {
    label: "Reports",
    index: 2,
    Component: GraphBuilder,
  },
  {
    label: "Onboarding",
    index: 3,
    Component: Onboarding,
  },
];

function App() {
  const [view, setView] = useState<EditorView | null>(null);
  const [currentNote, setCurrentNote] = useState<number | null>(null);
  const [showmenu, setShowmenu] = useState<boolean>(true);
  const [feedbackbar, setFeedbackbar] = useState<boolean>(false);
  const [L2active, setL2active] = useState<boolean>(false);
  // const [L1active, setL1active] = useState<boolean>(false);
  const [L1trigger, setL1trigger] = useState<boolean>(false);
  const [timespent, setTimespent] = useState<number>(0);
  const [viewHelp, setViewHelp] = useState<boolean>(false);

  // tab menu
  const [selectedTab, setSelectedTab] = useState<number>(tabs[0].index);

  // needed for auto resetting feedback sidebar
  const [feedbackKey, setFeedbackKey] = useState(1);

  let feedbackKeyChange = () => {
    setFeedbackKey(feedbackKey + 1);
  };

  useEffect(() => {
    ReactModal.setAppElement("#root");
  }, []);

  useEffect(() => {
    // On first load clear popups, sidebars, highlight & placeholder tables
    // Necessary when using Dexie.js as state
    setFeedbackbar(false);
    if (currentNote === null) {
      console.log("clearing state dbs");
      db.sidebars.clear();
      db.placeholders.update(1, { display: false });
      db.placeholders.clear();
      db.highlights.update(1, { active: false });
      db.highlights.clear();
      db.popups.clear();
      setL2active(false);
      // setL1active(false);
    } else {
      db.logs.add({
        note: currentNote,
        realtime: Date.now(),
        timestamp: timespent,
        feature: "noteopen",
      });
    }
  }, [currentNote]);

  return (
    <div className="App">
      <Menu
        setCurrentNote={setCurrentNote}
        currentNote={currentNote}
        setShowmenu={setShowmenu}
        setViewHelp={setViewHelp}
      />
      <div className="App-header">
        {currentNote === null ? (
          <>
            <h1 className="homelogo noselect">Expresso+</h1>
            {/* <h1 className="homelogo">Expresso+</h1> */}
            <Tabs
              selectedTab={selectedTab}
              onClick={setSelectedTab}
              tabs={tabs}
            />
          </>
        ) : (
          <>
            <Popup
              setFeedbackbar={setFeedbackbar}
              currentNote={currentNote}
              timespent={timespent}
            />
            <Editor
              view={view}
              setView={setView}
              currentNote={currentNote}
              L2active={L2active}
              // L1active={L1active}
              // setL1active={setL1active}
              setL2active={setL2active}
              timespent={timespent}
              setTimespent={setTimespent}
              L1trigger={L1trigger}
              setL1trigger={setL1trigger}
            />
          </>
        )}
      </div>
      <ReactModal
        isOpen={viewHelp}
        onRequestClose={() => {
          setViewHelp(false);
        }}
        style={{
          overlay: {
            zIndex: "5",
            backgroundColor: "rgba(0,0,0,0.3)",
          },
          content: {
            background: "rgba(244, 241, 255, 0.7)",
            backdropFilter: "blur(8px)",
            borderRadius: "6px",
          },
        }}
      >
        <FAQ setViewHelp={setViewHelp} />
      </ReactModal>
      <FeedbackSidebar
        currentNote={currentNote}
        setFeedbackbar={setFeedbackbar}
        feedbackbar={feedbackbar}
        timespent={timespent}
        L2active={L2active}
        key={feedbackKey}
        remounter={feedbackKeyChange}
      />
    </div>
  );
}

export default App;
