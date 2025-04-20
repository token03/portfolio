import React, { useRef, useState } from "react";
import "./App.css";
import "./components/Icons.css";
import RainEffect from "./components/RainEffect";
import Scene from "./components/Scene";
import { MailIcon, GithubIcon, LinkedinIcon } from "./components/Icons";
import ClipboardNotification from "./components/ClipboardNotification";

function App() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const emailAddress = "mail@jessiezhong.com";

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailAddress).then(
      () => {
        setNotificationMessage(`copied ${emailAddress} to clipboard`);
        setNotificationVisible(true);
      },
      (err) => {
        console.error("Failed to copy email: ", err);
        setNotificationMessage("failed to copy email");
        setNotificationVisible(true);
      },
    );
  };

  const dismissNotification = () => {
    setNotificationVisible(false);
  };

  return (
    <>
      <Scene />
      <RainEffect
        coverRef={mainContainerRef as React.RefObject<HTMLDivElement>}
      />

      <ClipboardNotification
        message={notificationMessage}
        isVisible={notificationVisible}
        onDismiss={dismissNotification}
      />

      <div className="main-container" ref={mainContainerRef}>
        <section className="about-me">
          <div className="header-row">
            <h3 className="small-margin">hi im</h3>
            <div className="social-icons">
              <a
                href="https://github.com/token03"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                aria-label="GitHub Profile"
              >
                <GithubIcon />
              </a>
              <a
                href="https://linkedin.com/in/jessiezhongg"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-link"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon />
              </a>
              <a
                href="#"
                className="icon-link"
                aria-label="Copy Email Address"
                onClick={handleEmailClick}
              >
                <MailIcon />
              </a>
            </div>
          </div>
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
