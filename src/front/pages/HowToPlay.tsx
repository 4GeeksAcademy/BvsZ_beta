import React from "react";
import { Container, Row, Col, Card, Badge, Alert } from "react-bootstrap";
import Navigation from "../components/Navigation";

const HowToPlay: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container>
        {/* Hero Section */}
        <Row className="justify-content-center text-center mb-4">
          <Col lg={10}>
            <h1 className="display-4 fw-bold mb-3">
              ⚔️ How to Survive the{" "}
              <span className="text-bootstrap">Bootstrap</span> Apocalypse
            </h1>
            <p className="lead text-muted">
              Master the art of turret placement and defend your servers from
              the undead horde!
            </p>
          </Col>
        </Row>

        {/* Alert Section */}
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" className="text-center">
              <h4 className="alert-heading">🚨 Emergency Protocol Activated</h4>
              <p className="mb-0">
                The <span className="text-zombies">zombie</span> apocalypse has
                begun! Your servers are under attack. Deploy your defenses
                immediately!
              </p>
            </Alert>
          </Col>
        </Row>

        {/* Game Overview */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">🎮 Game Overview</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="text-primary">🎯 Objective</h5>
                    <p>
                      Protect your precious servers from waves of incoming{" "}
                      <span className="text-zombies">zombies</span> by
                      strategically positioning automated turrets using{" "}
                      <span className="text-bootstrap">Bootstrap</span> CSS
                      classes.
                    </p>

                    <h5 className="text-success">🏆 Victory Conditions</h5>
                    <ul>
                      <li>Survive all zombie waves</li>
                      <li>Keep your servers intact</li>
                      <li>
                        Maximize your score by eliminating zombies efficiently
                      </li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h5 className="text-danger">💀 Defeat Conditions</h5>
                    <ul>
                      <li>Zombies reach and destroy your servers</li>
                      <li>All your defenses are overwhelmed</li>
                    </ul>

                    <h5 className="text-info">⌨️ IDE-Style Controls</h5>
                    <p>
                      Experience coding-like gameplay with familiar developer
                      tools:
                    </p>
                    <ul>
                      <li>
                        <strong>🖱️ Click Class Buttons:</strong> Select
                        Bootstrap classes with simple button clicks
                      </li>
                      <li>
                        <strong>⌨️ Type in Code Block:</strong> Click in HTML
                        code and get IntelliSense-style autocomplete suggestions
                      </li>
                      <li>
                        <strong>💻 Hybrid Experience:</strong> Choose between
                        GUI buttons or direct code editing - both work the same
                        way!
                      </li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* The Threat */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="shadow h-100 border-danger">
              <Card.Header className="bg-danger text-white">
                <h3 className="mb-0">
                  🧟‍♂️ The <span className="text-zombies">Zombie</span> Threat
                </h3>
              </Card.Header>
              <Card.Body>
                <h5 className="text-danger">Behavior Patterns</h5>
                <ul>
                  <li>
                    <strong>Relentless March:</strong> Zombies move in straight
                    lines toward your servers
                  </li>
                  <li>
                    <strong>Column-based Movement:</strong> Each zombie follows
                    a specific column path
                  </li>
                  <li>
                    <strong>Varying Speeds:</strong> Different zombie types have
                    different movement speeds
                  </li>
                  <li>
                    <strong>Health System:</strong> Some zombies require
                    multiple hits to eliminate
                  </li>
                </ul>

                <Alert variant="warning" className="mt-3">
                  <strong>⚠️ Warning:</strong> Zombies become faster and more
                  numerous with each wave!
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow h-100 border-success">
              <Card.Header className="bg-success text-white">
                <h3 className="mb-0">🛡️ Your Defense System</h3>
              </Card.Header>
              <Card.Body>
                <h5 className="text-success">Automated Turrets</h5>
                <ul>
                  <li>
                    <strong>Auto-targeting:</strong> Turrets automatically
                    detect and fire at zombies in their column
                  </li>
                  <li>
                    <strong>Strategic Positioning:</strong> Your role is to move
                    turrets to optimal positions
                  </li>
                  <li>
                    <strong>Unlimited Ammo:</strong> Focus on positioning, not
                    reloading
                  </li>
                  <li>
                    <strong>Grid-based:</strong> Turrets operate within the
                    12-column Bootstrap grid system
                  </li>
                </ul>

                <Alert variant="success" className="mt-3">
                  <strong>💡 Pro Tip:</strong> The key to victory is predicting
                  zombie paths and positioning your turrets accordingly!
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bootstrap Classes Guide */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <Card.Header className="bg-info text-white">
                <h3 className="mb-0">
                  📚 Master <span className="text-bootstrap">Bootstrap</span>{" "}
                  Classes
                </h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h5 className="text-primary">🎯 Justify Content</h5>
                    <p>Control horizontal alignment of turrets:</p>
                    <ul className="list-unstyled">
                      <li>
                        <code className="text-success">
                          justify-content-start
                        </code>{" "}
                        - Left align
                      </li>
                      <li>
                        <code className="text-success">
                          justify-content-center
                        </code>{" "}
                        - Center align
                      </li>
                      <li>
                        <code className="text-success">
                          justify-content-end
                        </code>{" "}
                        - Right align
                      </li>
                    </ul>
                  </Col>

                  <Col md={4}>
                    <h5 className="text-warning">📏 Column Offsets</h5>
                    <p>Precise positioning with offset classes:</p>
                    <ul className="list-unstyled">
                      <li>
                        <code className="text-warning">offset-1</code> - Move 1
                        column right
                      </li>
                      <li>
                        <code className="text-warning">offset-2</code> - Move 2
                        columns right
                      </li>
                      <li>
                        <code className="text-warning">offset-3</code> - Move 3
                        columns right
                      </li>
                      <li>
                        <code className="text-warning">...</code> - Up to
                        offset-11
                      </li>
                    </ul>
                  </Col>

                  <Col md={4}>
                    <h5 className="text-info">🏗️ Grid System</h5>
                    <p>Understanding the 12-column grid:</p>
                    <ul className="list-unstyled">
                      <li>
                        <code className="text-info">col-1</code> to{" "}
                        <code className="text-info">col-12</code> - Column
                        widths
                      </li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* IDE-Style Controls Section */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-primary">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">💻 Developer-Friendly Controls</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="text-success">🖱️ Mouse Controls</h5>
                    <ul>
                      <li>
                        <strong>Click CSS Class Buttons:</strong> Select
                        Bootstrap classes with simple button clicks
                      </li>
                      <li>
                        <strong>Toggle Selection:</strong> Click again to
                        deselect or switch between similar classes
                      </li>
                      <li>
                        <strong>Visual Feedback:</strong> Selected classes are
                        highlighted and shown in "Active classes" display
                      </li>
                      <li>
                        <strong>Instant Application:</strong> Turrets reposition
                        immediately when you select a class
                      </li>
                    </ul>
                  </Col>

                  <Col md={6}>
                    <h5 className="text-warning">⌨️ Code-Style Input</h5>
                    <ul>
                      <li>
                        <strong>Type in Code Block:</strong> Click in the HTML
                        code area to start typing CSS classes
                      </li>
                      <li>
                        <strong>IntelliSense Autocomplete:</strong> Get smart
                        suggestions as you type Bootstrap classes
                      </li>
                      <li>
                        <strong>Tab/Enter:</strong> Accept autocomplete
                        suggestions to apply positioning
                      </li>
                      <li>
                        <strong>Real HTML Structure:</strong> See your classes
                        applied in actual Bootstrap HTML code
                      </li>
                      <li>
                        <strong>Dynamic Turret Count:</strong> Code adapts to
                        show correct number of turrets per level
                      </li>
                    </ul>
                  </Col>
                </Row>

                <Alert variant="info" className="mt-3">
                  <strong>💡 Developer Tip:</strong> Choose your preferred
                  coding style! Use mouse buttons for quick visual selection or
                  type directly into the HTML code block with IntelliSense
                  autocomplete. Both methods apply the same Bootstrap classes -
                  it's like having both a GUI and code editor!
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Strategy Guide */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <Card.Header className="bg-dark text-white">
                <h3 className="mb-0">🧠 Strategic Guide</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="text-success">✅ Best Practices</h5>
                    <ul>
                      <li>
                        <strong>Observe Patterns:</strong> Watch zombie spawn
                        patterns before placing turrets
                      </li>
                      <li>
                        <strong>Cover Key Lanes:</strong> Prioritize columns
                        with heavy zombie traffic
                      </li>
                      <li>
                        <strong>Use Spread Formation:</strong>{" "}
                        <code>justify-content-between</code>
                        for maximum coverage
                      </li>
                      <li>
                        <strong>Adapt Quickly:</strong> Reposition turrets as
                        wave patterns change
                      </li>
                      <li>
                        <strong>Learn from Failure:</strong> Each defeat teaches
                        valuable positioning lessons
                      </li>
                    </ul>
                  </Col>

                  <Col md={6}>
                    <h5 className="text-danger">❌ Common Mistakes</h5>
                    <ul>
                      <li>
                        <strong>Clustering Turrets:</strong> Don't put all
                        turrets in one area
                      </li>
                      <li>
                        <strong>Ignoring Edge Columns:</strong> Zombies can
                        sneak through outer lanes
                      </li>
                      <li>
                        <strong>Static Positioning:</strong> Failing to adapt to
                        changing wave patterns
                      </li>
                      <li>
                        <strong>Overthinking:</strong> Sometimes simple center
                        positioning works best
                      </li>
                      <li>
                        <strong>Not Using Offsets:</strong> Missing
                        opportunities for precise positioning
                      </li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Educational Goals */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow border-warning">
              <Card.Header className="bg-warning text-dark">
                <h3 className="mb-0">🎓 Learning Objectives</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="text-primary">Flexbox Mastery</h5>
                    <p>
                      Understand how{" "}
                      <span className="text-bootstrap">Bootstrap</span>'s
                      flexbox utilities work in practice through hands-on
                      gameplay.
                    </p>
                  </Col>
                  <Col md={6}>
                    <h5 className="text-success">Grid Understanding</h5>
                    <p>
                      Master the 12-column grid system by positioning defensive
                      elements across different screen layouts.
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="text-center">
          <Col>
            <Card className="shadow bg-dark text-white">
              <Card.Body>
                <h3 className="mb-3">Ready to Begin Your Defense?</h3>
                <p className="lead mb-4">
                  The fate of your servers rests in your hands. Use your newly
                  acquired
                  <span className="text-bootstrap"> Bootstrap</span> knowledge
                  to survive the apocalypse!
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <a href="/game" className="btn btn-success btn-lg">
                    ⚔️ Start Battle
                  </a>
                  <a href="/leaderboard" className="btn btn-info btn-lg">
                    👑 View Leaderboard
                  </a>
                  <a href="/" className="btn btn-outline-light btn-lg">
                    🏠 Back to Home
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HowToPlay;
