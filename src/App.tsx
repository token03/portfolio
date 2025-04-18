import "./App.css";

function App() {
  return (
    <div className="main-container">
      <section className="about-me">
        <h3 className="left-text small-margin">hi im</h3>
        <h1 className="left-text small-margin">jessie zhong</h1>
        <h3 className="left-text small-margin">third year cs @ ubc</h3>
      </section>

      <hr className="separator" />

      <section className="projects left-text top-margin">
        <h2 className="underlined-title">projects</h2>
        <h3 className="small-margin">card collector app</h3>
        <h3 className="small-margin">rhythm game classifier</h3>
        <h3 className="small-margin">ml manga translator</h3>
        <h3 className="small-margin">pokemon discord bot</h3>
      </section>

      <hr className="separator top-margin" />

      <section className="sections left-text top-margin">
        <h2 className="underlined-title">experience</h2>
        <h3 className="small-margin">emonster solutions</h3>
        <h3 className="small-margin">mastercard</h3>
      </section>
    </div>
  );
}

export default App;
