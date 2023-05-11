import React, { useState } from "react";
import CatLabel from "./CategoryLabel";
import "../Styles/SidebarCard.css";
// import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

interface sidebarcardprops {
  idx: number;
  header: string;
  content: { html: string; accent: string; label: string };
  buttonoptions: string[];
  expanded: boolean;
  // html: string;
  removeCard: (idx: number) => void;
}

export default function SidebarCard(props: sidebarcardprops) {
  let [expanded, setExpanded] = useState<boolean>(props.expanded);

  let handleExpand = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setExpanded(!expanded);
  };

  let handleClose = () => {
    props.removeCard(props.idx);
  };

  return (
    <div className="sidecard" key={props.idx}>
      <div className="foldable">
        <CatLabel label={props.content.label} accent={props.content.accent} />
        <div>
          <IconButton
            color="default"
            aria-label="Expand Card"
            component="button"
            style={{
              borderRadius: "12px",
              margin: "0 3px",
              padding: "1px",
            }}
            onClick={(e) => handleExpand(e)}
          >
            <ExpandMoreIcon />
          </IconButton>
          <IconButton
            color="default"
            aria-label="Close Card"
            component="button"
            style={{
              borderRadius: "24px",
              margin: "0 3px",
              padding: "1px",
            }}
            onClick={() => handleClose()}
          >
            <HighlightOffIcon />
          </IconButton>
        </div>
      </div>
      {expanded ? (
        // Need to rethink structure here! -----------------<<<<<<<-----------------<<<<<<<
        <div dangerouslySetInnerHTML={{ __html: props.content.html }} />
      ) : null}
    </div>
  );
}
