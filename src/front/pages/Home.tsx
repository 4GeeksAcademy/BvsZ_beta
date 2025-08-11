import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

const Home: React.FC = () => {
  return (
    <>
      <Navigation />
      <Container>
        {/* Hero Section - Introduction to the Game */}
        <Row className="justify-content-center text-center mb-1">
          <Col lg={12} className="hero-section">
            {/* Main heading using Bootstrap display utility */}
            <h1 className="display-4 fw-bold mb-4">
              <span className="text-bootstrap">Bootstrap</span>{" "}
              <span className="text-vs">vs</span>{" "}
              <span className="text-zombies">Zombies</span>
            </h1>
            {/* Subtitle using Bootstrap lead class for emphasis */}
            <p className="lead">
              Defend your servers from the zombie horde! Use{" "}
              <span className="text-bootstrap">Bootstrap's</span> classes to
              position your automated turrets and survive the apocalypse.
            </p>
            <p className="text-muted">
              An educational game that makes learning{" "}
              <span className="text-bootstrap">Bootstrap</span> flexbox fun and
              interactive. Play with mouse or keyboard controls designed for
              developers!
            </p>
          </Col>
        </Row>

        {/* Feature Cards Section */}
        <Row className="justify-content-center mb-1">
          {/* Game Mode Card */}
          <Col md={6} className="mb-3">
            <Card className="h-100 shadow-sm border-success">
              <Card.Body className="text-center d-flex flex-column">
                <Card.Title className="text-success">🎮 Battle Mode</Card.Title>
                <Card.Text className="flex-grow-1">
                  Deploy turrets using{" "}
                  <span className="text-bootstrap">Bootstrap</span> flex classes
                  to protect your servers. Learn by doing in this interactive
                  tower defense experience where turrets fire automatically! Use
                  class buttons or type code directly - like having both GUI and
                  terminal!
                </Card.Text>
                <Link to="/game" className="mt-auto">
                  <Button variant="success" size="lg" className="w-100">
                    ⚔️ Start Battle
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>

          {/* Leaderboard Card */}
          <Col md={6} className="mb-1">
            <Card className="h-100 shadow-sm border-info">
              <Card.Body className="text-center d-flex flex-column">
                <Card.Title className="text-info">🏆 Hall of Fame</Card.Title>
                <Card.Text className="flex-grow-1">
                  Check the leaderboard to see who are the ultimate{" "}
                  <span className="text-bootstrap">Bootstrap</span> warriors.
                  Compete with classmates and track your progress.
                </Card.Text>
                <Link to="/leaderboard" className="mt-auto">
                  <Button variant="info" size="lg" className="w-100">
                    👑 View Heroes
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* How to Play & News Section */}
        <Row>
          {/* How to Play Section */}
          <Col lg={8}>
            <Card className="shadow h-100">
              <Card.Header className="bg-dark text-white">
                <h3 className="mb-0">
                  ⚔️ How to Survive the{" "}
                  <span className="text-bootstrap">Bootstrap</span> Apocalypse
                </h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <h5 className="text-danger">
                      🧟‍♂️ The <span className="text-zombies">Zombie</span> Threat
                    </h5>
                    <p>
                      Undead creatures march relentlessly toward your servers.
                      Stop them by positioning your turrets on the 12-column{" "}
                      <span className="text-bootstrap">Bootstrap</span> grid.
                    </p>

                    <h5 className="text-primary">
                      🛡️ Automated Defense System
                    </h5>
                    <p>
                      Your turrets fire automatically at any{" "}
                      <span className="text-zombies">zombie</span> in their
                      column. Your job is to move the turrets to the right
                      columns to intercept the horde.
                    </p>

                    <h5 className="text-info">💻 IDE-Style Controls</h5>
                    <p>
                      Play with familiar developer controls:{" "}
                      <strong>🖱️ click CSS class buttons</strong> for quick
                      selection or{" "}
                      <strong>⌨️ type directly in HTML code</strong> with
                      IntelliSense autocomplete. Choose your preferred coding
                      style!
                    </p>

                    <div className="text-center mt-4">
                      <Link to="/how-to-play">
                        <Button variant="warning" size="lg">
                          📚 Read Full Guide
                        </Button>
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* News Section */}
          <Col lg={4}>
            <Card className="shadow h-100">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">📰 Latest News</h3>
              </Card.Header>
              <Card.Body>
                <h5 className="text-info">New Features & Updates!</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Aug 10, 2025:</strong> New <code>offset-*</code>{" "}
                    classes added for more precise turret placement!
                  </li>
                  <li className="mb-2">
                    <strong>Aug 5, 2025:</strong> Server defense protocol
                    initiated. Protect the servers at all costs!
                  </li>
                  <li className="mb-2">
                    <strong>Jul 28, 2025:</strong> Turrets now fire
                    automatically. Focus on your positioning strategy!
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
