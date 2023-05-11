/**
 * Menu
 *
 * - see menu.css for styles
 * - handles note management
 */

import React, { useEffect, useState } from "react";
import { db, downloadDB, downloadDBlite } from "../../Dexie/db";
import NoteList from "./NoteList";

import { IconButton, Tooltip, Typography } from "@mui/material";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";

import "../../Styles/Menu.css";

interface MenuProps {
  currentNote: number | null;
  setCurrentNote: React.Dispatch<React.SetStateAction<number | null>>;
  setShowmenu: React.Dispatch<React.SetStateAction<boolean>>;
  setViewHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Menu({
  currentNote,
  setCurrentNote,
  setShowmenu,
  setViewHelp,
}: MenuProps) {
  const [showbar, setShowbar] = useState<"hide" | "show">("hide");

  async function addNote() {
    let existent = await db.notes.toArray();
    let untitled = existent
      .filter((val) => {
        return val.title.toLowerCase().includes("new entry");
      })
      .sort();

    try {
      const id = await db.notes.add({
        title: "New Entry" + (untitled.length > 0 ? " " + untitled.length : ""),
        content: "",
        creationdate: Date.now(),
        lastedit: Date.now(),
        timeduration: 0,
        stats: {}, // not implemented
      });

      // console.log("added new note with id", id);
      return id;
    } catch (error) {
      console.log(`Failed to add new note: ${error}`);
      return null;
    }
  }
  useEffect(() => {
    let barstate = showbar === "hide" || currentNote === null ? false : true;
    setShowmenu(barstate);
  }, [showbar]);

  return (
    <>
      {
        {
          hide: (
            <div className="menu-sidebar off">
              <IconButton
                onClick={() => {
                  setShowbar(showbar === "hide" ? "show" : "hide");
                }}
                aria-label="delete"
                color="default"
              >
                <MenuIcon />
              </IconButton>
            </div>
          ),
          show: (
            <div className="menu-sidebar on">
              <header>
                <IconButton
                  onClick={() => {
                    setShowbar(showbar === "hide" ? "show" : "hide");
                  }}
                  aria-label="Close Menu"
                  color="default"
                >
                  <ClearIcon sx={{ fontSize: "32px" }} />
                </IconButton>

                <Tooltip
                  title={<Typography fontSize={14}>Home</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Home"
                    color="default"
                    onClick={() => {
                      setCurrentNote(null);
                    }}
                  >
                    <HomeIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={<Typography fontSize={14}>New Entry</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="New Entry"
                    color="default"
                    onClick={() => {
                      addNote().then((id) => {
                        if (id) {
                          setCurrentNote(id as number);
                          setShowbar("hide");
                        }
                      });
                    }}
                  >
                    <NoteAddIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={<Typography fontSize={14}>Logs</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Download Logs"
                    color="default"
                    onClick={downloadDB}
                  >
                    <FileDownloadIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={<Typography fontSize={14}>Lite Logs</Typography>}
                  placement="right"
                >
                  <IconButton
                    aria-label="Download Lite Logs"
                    color="default"
                    onClick={downloadDBlite}
                  >
                    <DownloadForOfflineIcon sx={{ fontSize: "32px" }} />
                  </IconButton>
                </Tooltip>
              </header>
              {/* <button className="newentrybutton" >New</button> */}
              <NoteList
                setCurrentNote={setCurrentNote}
                setShowbar={setShowbar}
                currentNote={currentNote}
              />
              <div className="menu-footer">
                <IconButton
                  color="default"
                  onClick={() => {
                    setViewHelp(true);
                  }}
                >
                  <HelpOutlineIcon />
                </IconButton>
                <p>hci@ucla</p>
              </div>
            </div>
          ),
        }[showbar]
      }
    </>
  );
}
