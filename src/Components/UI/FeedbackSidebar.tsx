import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Sidebar } from "../Dexie/db";
import "../Styles/FeedbackSidebar.css";

import { Button, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
// import MenuIcon from "@mui/icons-material/Menu";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

import { useTransition, animated } from "react-spring";

import SidebarCard from "./SidebarCard";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123123",
    },
  },
});

interface FeedbackSidebarProps {
  currentNote: number | null;
  setFeedbackbar: React.Dispatch<React.SetStateAction<boolean>>;
  feedbackbar: boolean;
  timespent: number;
  L2active: boolean;
  remounter: () => void;
}

export default function FeedbackSidebar({
  currentNote,
  setFeedbackbar,
  feedbackbar,
  timespent,
  L2active,
  remounter,
}: FeedbackSidebarProps) {
  const [data, setData] = useState<Sidebar | null>(null);
  const [reload, setReload] = useState<boolean>(false);
  const transition = useTransition(feedbackbar, {
    config: {
      mass: 3,
      friction: 60,
      tension: 200,
    },
    from: { x: 500, y: 0, opacity: 0.5 },
    enter: { x: 0, y: 0, opacity: 1 },
    leave: { x: 500, y: 0, opacity: 0.5 },
  });

  useEffect(() => {
    if (!reload) {
      return;
    }

    if (data !== null) {
      if (data?.content) {
        if (!L2active) {
          setFeedbackbar(false);
        }
        setFeedbackbar(data?.display);
      }
    }
  }, [data, L2active]);

  useEffect(() => {
    if (currentNote !== null) {
      if (feedbackbar) {
        db.logs.add({
          note: currentNote!,
          realtime: Date.now(),
          timestamp: timespent,
          feature: "L2sidebar",
          featurestate: "enable",
          comments: `title: ${data!.title}`,
        });
      } else {
        // setTimeout(() => {}, 500);
        db.logs.add({
          note: currentNote!,
          realtime: Date.now(),
          timestamp: timespent,
          feature: "L2sidebar",
          featurestate: "disable",
          comments: null,
        });
      }
    }
  }, [feedbackbar]);

  let removeCard = (idx: number) => {
    let safeRemount = () => {
      setData(null);
      setFeedbackbar(false);
      remounter();
    };

    setReload(false);
    if (data?.content !== null && Array.isArray(data?.content)) {
      const newContent = [...data!.content];
      newContent.splice(idx, 1);
      if (newContent.length <= 0) {
        safeRemount();
      }
      setData({ ...data!, content: newContent });
    } else {
      safeRemount();
    }
  };

  useEffect(() => {
    if (data === null) {
      return;
    }
    if (data!.content === null || data!.content.length === 0) {
      setFeedbackbar(false);
    }
  }, [data]);

  useLiveQuery(async () => {
    const result = await db.sidebars.get(1);
    if (result !== undefined) {
      setFeedbackbar(result.display!);
      setData(result);
      return result.display;
    }
  });

  return (
    // OLD: -------------------------------------
    // <>
    //   {transition((style, item) =>
    //     item ? (
    //       <animated.div style={style} className="feedback-sidebar on">
    //         <header>
    //           <ThemeProvider theme={theme}>
    //             <IconButton
    //               onClick={() => setFeedbackbar(false)}
    //               aria-label="delete"
    //               color="primary"
    //             >
    //               <ClearIcon />
    //             </IconButton>
    //           </ThemeProvider>
    //         </header>
    //         <div className="Feedback">
    //           <>
    //             {data?.content !== null && Array.isArray(data?.content)
    //               ? data!.content.map((html, idx) => {
    //                   return (
    //                     <div
    //                       className="card"
    //                       dangerouslySetInnerHTML={{ __html: html }}
    //                     ></div>
    //                   );
    //                 })
    //               : null}
    //             {data?.content !== null && !Array.isArray(data?.content) ? (
    //               <div
    //                 className="card"
    //                 dangerouslySetInnerHTML={{ __html: data!.content }}
    //               ></div>
    //             ) : null}
    //           </>
    //         </div>
    //         <div className="rewrite-btn">
    //           {data!.rephrase ? (
    //             <ThemeProvider theme={theme}>
    //               <Button
    //                 onClick={() => {
    //                   db.placeholders.update(1, { active: true });
    //                 }}
    //                 variant="contained"
    //               >
    //                 Rewrite
    //               </Button>
    //             </ThemeProvider>
    //           ) : null}
    //         </div>
    //       </animated.div>
    //     ) : (
    //       <animated.div style={style} className="feedback-sidebar off">
    //         {L2active === true && data?.content! ? (
    //           <IconButton
    //             onClick={() => {
    //               setFeedbackbar(true);
    //             }}
    //           >
    //             <NavigateBeforeIcon />
    //           </IconButton>
    //         ) : (
    //           ""
    //         )}
    //       </animated.div>
    //     )
    //   )}
    // </>

    // New: -------------------------------------
    <div className="SidebarContainer">
      {transition((style, item) =>
        item ? (
          <animated.div style={style} className="sidebarcardlist">
            {/* SIDEBAR INTERFACE UPDATE - WILL ALWAYS BE ARRAY OF OBJECTS ----- */}
            {data?.content !== null && Array.isArray(data?.content)
              ? data!.content.map((card, idx) => {
                  return (
                    <>
                      <SidebarCard
                        key={idx}
                        idx={idx}
                        header={"header"}
                        content={card}
                        buttonoptions={["yes", "no"]}
                        expanded={false}
                        removeCard={removeCard}
                      />
                    </>
                  );
                })
              : null}
          </animated.div>
        ) : (
          ""
        )
      )}
    </div>
  );
}
