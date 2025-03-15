import "./App.css";

function App() {
  return (
    <div className="main-container">
      <section className="about-me">
        <h3 className="left-text small-margin">hi im</h3>
        <h1 className="left-text underlined-title">jessie zhong</h1>
        <h3 className="left-text top-margin">third year cs @ ubc</h3>
      </section>
      <section className="projects">
        <h2 className="right-text underlined-title">projects</h2>
        <div className="project"></div>
        <div className="project"></div>
        <div className="project"></div>
      </section>
      <section className="sections">
        <h2 className="right-text underlined-title">experience</h2>
        <div className="emonster"></div>
        <div className="mastercard"></div>
        <div className="mastercard"></div>
      </section>
    </div>
  );
}

export default App;
