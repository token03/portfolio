import "./App.css";

function App() {
  return (
    <div className="main-container" style={{ width: "50vw" }}>
      <section className="about-me">
        <h3 style={{ textAlign: "left", margin: 0 }}>hi im</h3>
        <h1
          style={{
            textAlign: "left",
            margin: 0,
            fontFamily: "Georgia, serif",
            textDecoration: "underline",
            textDecorationThickness: "2px",
          }}
        >
          jessie zhong
        </h1>
        <h3 style={{ textAlign: "left", marginTop: 10 }}>
          third year cs @ ubc
        </h3>
      </section>
      <section className="projects">
        <h2
          style={{
            textAlign: "right",
            textDecoration: "underline",
            textDecorationThickness: "2px",
          }}
        >
          projects
        </h2>
        <div className="project"></div>
        <div className="project"></div>
        <div className="project"></div>
      </section>
      <section className="sections">
        <h2
          style={{
            textAlign: "right",
            textDecoration: "underline",
            textDecorationThickness: "2px",
          }}
        >
          experience
        </h2>
        <div className="emonster"></div>
        <div className="mastercard"></div>
        <div className="mastercard"></div>
      </section>
    </div>
  );
}

export default App;
