import React from "react";

export default function Welcome() {
  return (
    <div style={{ textAlign: "left", width: "90%" }}>
      <h2>Welcome Back!</h2>
      <h3>Reminders:</h3>
      <ul>
        <li>Write continuously for 15 minutes</li>
        <li>Explore your current thoughts, concerns, emotions</li>
        <li>Try out the Expresso+ features</li>
      </ul>
      <h3>Useful Shortcuts</h3>
      <ul>
        <li>
          <b>Cmd/Ctrl+o</b> to toggle analysis
        </li>
        <li>
          <b>Cmd/Ctrl+space</b> to get Expresso suggestion
        </li>
        <li>
          <b>Esc</b> to cancel
        </li>
      </ul>
      <h3 style={{ fontWeight: "400" }}>Happy writing!</h3>
    </div>
  );
}
