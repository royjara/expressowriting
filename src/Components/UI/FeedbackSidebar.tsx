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
}

export default function FeedbackSidebar({
  currentNote,
  setFeedbackbar,
  feedbackbar,
  timespent,
  L2active,
}: FeedbackSidebarProps) {
  const [data, setData] = useState<Sidebar | null>(null);
  const transition = useTransition(feedbackbar, {
    config: {
      mass: 6,
      friction: 60,
      tension: 200,
    },
    from: { x: 500, y: 0, opacity: 0.5 },
    enter: { x: 0, y: 0, opacity: 1 },
    leave: { x: 500, y: 0, opacity: 0.5 },
  });

  useEffect(() => {
    // console.log("feedbackbar change in content", data);
    setFeedbackbar(data?.display!);
  }, [data]);

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

  useLiveQuery(async () => {
    const result = await db.sidebars.get(1);
    if (result !== undefined) {
      setFeedbackbar(result.display!);
      setData(result);
      return result.display;
    }
  });

  return (
    <>
      {transition((style, item) =>
        item ? (
          <animated.div style={style} className="feedback-sidebar on">
            <header>
              <ThemeProvider theme={theme}>
                <IconButton
                  onClick={() => setFeedbackbar(false)}
                  aria-label="delete"
                  color="primary"
                >
                  <ClearIcon />
                </IconButton>
              </ThemeProvider>
            </header>
            <div className="Feedback">
              <>
                {data?.content !== null && Array.isArray(data?.content)
                  ? data!.content.map((html, idx) => {
                      return (
                        <div
                          className="card"
                          dangerouslySetInnerHTML={{ __html: html }}
                        ></div>
                      );
                    })
                  : null}
                {data?.content !== null && !Array.isArray(data?.content) ? (
                  <div
                    className="card"
                    dangerouslySetInnerHTML={{ __html: data!.content }}
                  ></div>
                ) : null}
              </>
            </div>
            <div className="rewrite-btn">
              {data!.rephrase ? (
                <ThemeProvider theme={theme}>
                  <Button
                    onClick={() => {
                      db.placeholders.update(1, { active: true });
                    }}
                    variant="contained"
                  >
                    Rewrite
                  </Button>
                </ThemeProvider>
              ) : null}
            </div>
          </animated.div>
        ) : (
          <animated.div style={style} className="feedback-sidebar off">
            {L2active === true && data?.content! ? (
              <IconButton
                onClick={() => {
                  setFeedbackbar(true);
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
            ) : (
              ""
            )}
          </animated.div>
        )
      )}
    </>
    // <div
    //   className="SidebarContainer"
    //   style={{
    //     display: "flex",
    //     flexDirection: "column",
    //     width: "24vw",
    //     margin: "20px",
    //   }}
    // >
    //   <SidebarCard
    //     header={"header"}
    //     content={"some content"}
    //     buttonoptions={["yes", "no"]}
    //     expanded={true}
    //   />
    //   <SidebarCard
    //     header={"header"}
    //     content={"some content"}
    //     buttonoptions={["yes", "no"]}
    //     expanded={false}
    //   />
    // </div>
  );
}
