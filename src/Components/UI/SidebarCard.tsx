import React, { useEffect, useState } from "react";
import CatLabel from "./CatLabel";
import "../Styles/SidebarCard.css";
import Button from "@mui/material/Button";

interface sidebarcardprops {
  header: string;
  content: string;
  buttonoptions: string[];
  expanded: boolean;
}

export default function SidebarCard(props: sidebarcardprops) {
  let [stateclass, setStateClass] = useState("");

  useEffect(() => {
    if (props.expanded) {
      setStateClass("expanded");
    } else {
      setStateClass("");
    }
  }, [props.expanded]);

  //

  return (
    <div className={"sidecard " + stateclass}>
      <div className="foldable">
        <CatLabel
          //   label={"\u26AB Details: Cognitive Distortion"}
          label={"Details: Cognitive Distortion"}
          palette={"lightblue"}
        />
        <p onClick={() => {}}>X</p>
      </div>
      {props.expanded ? (
        // Need to rethink structure here! -----------------<<<<<<<
        <div>
          <h3>{props.header}</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          {props.buttonoptions.map((astr) => (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {}}
              color="primary"
            >
              {astr}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
