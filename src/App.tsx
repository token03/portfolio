import React, { useRef } from "react";
import "./App.css";
import RainEffect from "./RainEffect";

function App() {
  const mainContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <RainEffect
        coverRef={mainContainerRef as React.RefObject<HTMLDivElement>}
      />

      <div className="main-container" ref={mainContainerRef}>
        <section className="about-me">
          <h3 className="left-text small-margin">hi im</h3>
          <h1 className="left-text small-margin">jessie zhong</h1>
          <h3 className="left-text small-margin">third year cs @ ubc</h3>
        </section>

        <hr className="separator" />

        <section className="projects left-text">
          <h2 className="underlined-title">projects</h2>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/clodlog-native"
              target="_blank"
              rel="noopener noreferrer"
            >
              card collector app
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/osu_oracle"
              target="_blank"
              rel="noopener noreferrer"
            >
              rhythm game classifier
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/kakiyomi"
              target="_blank"
              rel="noopener noreferrer"
            >
              ml manga translator
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/clodsire-bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              pokemon discord bot
            </a>
          </h3>
        </section>

        <hr className="separator" />

        <section className="sections left-text">
          <h2 className="underlined-title">experience</h2>
          <h3 className="small-margin">emonster solutions</h3>
          <h3 className="small-margin">mastercard</h3>
        </section>
      </div>
    </>
  );
}

export default App;
