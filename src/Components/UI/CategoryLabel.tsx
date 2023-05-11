import React from "react";

interface catlabelprops {
  label: string;
  accent: string;
}

export default function CatLabel({ label, accent }: catlabelprops) {
  // input hex and get rgba
  const hexToRGBA = (hex: string, alpha: number) => {
    // Remove the '#' symbol if it exists
    const sanitizedHex = hex.replace("#", "");

    // Convert the hex string into RGB values
    const r = parseInt(sanitizedHex.substring(0, 2), 16);
    const g = parseInt(sanitizedHex.substring(2, 4), 16);
    const b = parseInt(sanitizedHex.substring(4, 6), 16);

    // Create the RGBA string with the provided alpha value
    console.log(`rgba(${r}, ${g}, ${b}, ${alpha})`);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <h5
      style={{
        backgroundColor: hexToRGBA(accent, 0.2),
        padding: "3px 6px 3px 5px",
        borderRadius: "4px",
        fontWeight: "500",
      }}
    >
      {/* span is the circle detail */}
      <span
        style={{
          backgroundColor: accent,
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
