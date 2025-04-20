import React, { useRef } from "react";
import "./App.css";
import RainEffect from "./RainEffect";
import Scene from "./Scene";

function App() {
  const mainContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Scene />

      <RainEffect
        coverRef={mainContainerRef as React.RefObject<HTMLDivElement>}
      />

      <div className="main-container" ref={mainContainerRef}>
        <section className="about-me">
          <h3 className="left-text small-margin">hi im</h3>
          <h1 className="left-text small-margin">jessie</h1>
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
              clodlog
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/osu_oracle"
              target="_blank"
              rel="noopener noreferrer"
            >
              osu!oracle
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/token03/kakiyomi"
              target="_blank"
              rel="noopener noreferrer"
            >
              kakiyomi
            </a>
          </h3>
          <h3 className="small-margin">
            <a
              href="https://github.com/InterviewPal/InterviewPal"
              target="_blank"
              rel="noopener noreferrer"
            >
              interviewpal
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
