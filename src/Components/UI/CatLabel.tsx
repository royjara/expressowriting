import React from "react";

interface catlabelprops {
  label: string;
  palette: string;
}

export default function CatLabel({ label, palette }: catlabelprops) {
  return (
    <h5
      style={{
        backgroundColor: palette,
        padding: "1px 3px 1px 3px",
        borderRadius: "4px",
        color: "blue",
      }}
    >
      <span
        // className="dot"
        style={{
          backgroundColor: "blue",
          height: "9px",
          width: "9px",
          borderRadius: "50%",
          display: "inline-block",
        }}
      ></span>
      {" " + label}
    </h5>
  );
}
