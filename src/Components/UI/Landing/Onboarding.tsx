import React from "react";

export default function Onboarding() {
  return (
    <div style={{ textAlign: "left", width: "88%" }}>
      <h1>Thanks for trying out Expresso+!</h1>
      <p>
        Here, you can use writing as a tool to explore your thoughts, feelings,
        and experiences. This can be a powerful way to process difficult
        emotions and gain insight into your mental health.
      </p>
      <p>
        To get started, simply create a new entry and begin writing. You can
        write about whatever is on your mind, but Expresso+ works best if you
        write about feelings, challenges or concerns you might have at the
        moment.
      </p>
      <h2 id="about-the-app">About the app</h2>
      <p>
        The goal of the Expresso project is to develop a computational assistant
        capable of supporting expressive writing sessions by encouraging more
        continuous writing, promoting psychological self-awareness, and
        prompting users to reframe negative thought patterns.{" "}
      </p>
      <p>
        At this stage, the platform is still under development. With your
        feedback, we'll be able to further improve this project into a fully
        functional and truly helpful assistant for people who are unable to
        access immediate therapy.
      </p>

      <br />
      <h3 style={{ fontWeight: 400 }}>Overview of the novel features: </h3>
      <div
        style={{
          margin: "0px 10px 0px 36px",
          width: "fit-content",
        }}
      >
        <h2 style={{ fontWeight: 400, marginTop: "0px" }}>Expresso</h2>
        <ul>
          <li>Suggestions to encourage continuous writing</li>
          <li>
            Manual completion to promote more thoughtful interactions with
            suggestions
          </li>
        </ul>
        <h2 style={{ fontWeight: 400 }}>Analysis</h2>
        <ul>
          <li>
            Detection of words or phrases that may suggest different mental
            health patterns
          </li>
          <li>
            Interacting with the marks prompts feedback which can be further
            inquired or <i>dismissed</i> if irrelevant
          </li>
        </ul>
        <h2 style={{ fontWeight: 400 }}>Reframing</h2>
        <ul>
          <li>
            If available on the right sidebar, Expresso can help you{" "}
            <i>reframe</i> some negative thoughts
          </li>
        </ul>
      </div>

      <br />

      <p>
        We hope that you enjoy using our app and that writing becomes a valuable
        part of your self-care routine.
      </p>

      <h2 style={{ fontWeight: 400 }}>Happy writing!</h2>

      {/* <p>
        Expresso+ is an expressive writing platform meant to provide information
        and editing assistance.
      </p>
      <p>
        Use the left menu to create entries. When editing an entry, you'll also
        be able to toggle Analysis and Editing Assistance features. In case you
        don't want <b>Editing Assistance</b> to show up automatically, you can
        press the "Stuck" button to get single assistance.
      </p>
      <h2>Analysis</h2>
      <p>
        Our text analysis will show markers near words that might suggest a
        thought pattern associated with your mental health. These markers do not
        mean that your writing is wrong. Instead, their purpose is to give you
        more insight into what your writing might mean. <br />
        You can find out more information by clicking these markers and reading
        the popups. For more information, click on the <b>More</b> button in the
        popup to open the right sidebar, which holds more detailed feedback.
      </p>
      <h2>Editing Assistance</h2>
      <p>
        <b>Editing Assistance</b> suggests some text. These phrases, words, or
        sentence pieces will help you continue writing non-stop. Expressive
        writing works best when we write with no interruptions. <br />
        Additionally, our analysis can help you reframe some words (bottom of
        the right sidebar). Doing this will help you change negative
        perspectives into not-so-negative ones.
      </p>

      <h2>Need more help?</h2>
      <p>
        The help button is at the bottom of the left menu. Here, you can refer
        back to the instructions. You can also find external resources if you
        are not feeling well as a consequence of using this platform, and need
        to talk to someone. Lastly, if there are any errors or problems with the
        platform, there is a contact email so you can reach the developers and
        tell them if something is wrong.
      </p> */}
    </div>
  );
}
