import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getApiEndpoint } from "../utils/config";
import { getUserStatsMouse, getUserStatsKeyboard } from "../utils/auth";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Profile.css";

interface Profile {
  id: string;
  username: string;
  email: string;
}

interface GameStats {
  bullets_fired: number;
  created_at: string;
  input_method: string;
  levels_completed: number;
  score: number;
  total_play_time: number;
  typing_accuracy: number;
  zombies_killed_by_environment: number;
  zombies_killed_by_player: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const profile = store.profile;
  const [mouseStats, setMouseStats] = useState<GameStats | null>(null);
  const [keyboardStats, setKeyboardStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const token = localStorage.getItem("token");

  // Función para formatear el tiempo de juego
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch(getApiEndpoint("PROFILE"), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("request failed");
      }

      const data = await res.json();
      dispatch({ type: "UPDATE_PROFILE", payload: data.user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to fetch profile" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchGameStats();
  }, [token, navigate, fetchProfile]);

  useEffect(() => {
    if (profile && profile.id) {
      localStorage.setItem("profile", JSON.stringify(profile));
    }
  }, [profile]);

  const fetchGameStats = async () => {
    setIsLoading(true);

    // Obtenemos cada conjunto de estadísticas por separado
    try {
      const mouseResponse = await getUserStatsMouse();
      setMouseStats(mouseResponse.stats || null);
    } catch (error) {
      console.error("Error fetching mouse stats:", error);
      setMouseStats(null);
      // No mostramos mensaje de error si es un 404, es esperado cuando no hay datos
      if (!(error.message && error.message.includes("404"))) {
        setMessage({
          type: "error",
          text: "Failed to fetch mouse statistics",
        });
      }
    }

    try {
      const keyboardResponse = await getUserStatsKeyboard();
      setKeyboardStats(keyboardResponse.stats || null);
    } catch (error) {
      console.error("Error fetching keyboard stats:", error);
      setKeyboardStats(null);
      // No mostramos mensaje de error si es un 404, es esperado cuando no hay datos
      if (!(error.message && error.message.includes("404"))) {
        setMessage({
          type: "error",
          text: "Failed to fetch keyboard statistics",
        });
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div
          className="d-flex flex-column justify-content-center align-items-center vh-100"
          style={{ marginTop: "-80px" }}
        >
          <div
            className="spinner-border text-white"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-white fs-4">Loading...</p>
        </div>
      </>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} className="">
            <span className="text-center">
              <h1 className="mb-4">Warrior Profile</h1>
            </span>

            {message && (
              <Alert
                variant={message.type}
                onClose={() => setMessage(null)}
                dismissible
              >
                {message.text}
              </Alert>
            )}

            <Card className="mb-4">
              <Card.Header>
                <h3>👤Profile Information</h3>
              </Card.Header>
              <Card.Body>
                {profile ? (
                  <div>
                    <Row>
                      <Col md={6}>
                        <h4>
                          <span className="text-bootstrap">Email:</span>{" "}
                          {profile.email}
                        </h4>
                      </Col>
                      <Col md={6}>
                        <h4>
                          <span className="text-bootstrap">Warrior Name:</span>{" "}
                          {profile.username}
                        </h4>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <h4>
                          <span className="text-bootstrap">User ID:</span>{" "}
                          {profile.id}
                        </h4>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h3>🎮 Game Statistics</h3>
              </Card.Header>
              <Card.Body>
                {!mouseStats && !keyboardStats ? (
                  <div className="text-center">
                    <p>No game statistics yet!</p>
                    <p className="mt-3">
                      Ready to make your mark? Jump into the game and start
                      racking up those zombie kills!
                    </p>
                    <Button
                      variant="primary"
                      className="mt-2"
                      onClick={() => navigate("/game")}
                    >
                      Play Now
                    </Button>
                  </div>
                ) : (
                  <div>
                    {/* Mouse Stats */}
                    {mouseStats ? (
                      <div className="stats-section mb-4">
                        <h5 className="text-primary mb-3">🖱️ Mouse Stats</h5>
                        <div className="mb-2">
                          <small className="text-muted">
                            Last updated: {formatDate(mouseStats.created_at)} |
                            Input Method: {mouseStats.input_method}
                          </small>
                        </div>
                        <Row>
                          <Col md={6}>
                            <div className="stat-item mb-3">
                              <h6 className="text-primary">
                                Zombies Killed by Player
                              </h6>
                              <h4 className="stat-value">
                                {mouseStats.zombies_killed_by_player}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-success">Max. Score</h6>
                              <h4 className="stat-value">
                                {mouseStats.score.toLocaleString()}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-info">Total Play Time</h6>
                              <h4 className="stat-value">
                                {formatPlayTime(mouseStats.total_play_time)}
                              </h4>
                            </div>
                            {mouseStats.typing_accuracy && (
                              <div className="stat-item mb-3">
                                <h6 className="text-info">Typing Accuracy</h6>
                                <h4 className="stat-value">
                                  {mouseStats.typing_accuracy.toFixed(1)}%
                                </h4>
                              </div>
                            )}
                          </Col>
                          <Col md={6}>
                            <div className="stat-item mb-3">
                              <h6 className="text-warning">Levels Completed</h6>
                              <h4 className="stat-value">
                                {mouseStats.levels_completed}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-danger">Bullets Fired</h6>
                              <h4 className="stat-value">
                                {mouseStats.bullets_fired.toLocaleString()}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-secondary">
                                Environment Kills
                              </h6>
                              <h4 className="stat-value">
                                {mouseStats.zombies_killed_by_environment}
                              </h4>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <div className="stats-missing-card text-center mb-4">
                        <h5 className="text-primary mb-3">🖱️ Mouse Stats</h5>
                        <p>You haven't played with a mouse yet!</p>
                        <Button
                          variant="outline-primary"
                          className="try-mode-button"
                          onClick={() => navigate("/game")}
                        >
                          Try Mouse Mode
                        </Button>
                      </div>
                    )}

                    {mouseStats && keyboardStats && <hr />}

                    {/* Keyboard Stats */}
                    {keyboardStats ? (
                      <div className="stats-section mb-4">
                        <h5 className="text-success mb-3">⌨️ Keyboard Stats</h5>
                        <div className="mb-2">
                          <small className="text-muted">
                            Last updated: {formatDate(keyboardStats.created_at)}{" "}
                            | Input Method: {keyboardStats.input_method}
                          </small>
                        </div>
                        <Row>
                          <Col md={6}>
                            <div className="stat-item mb-3">
                              <h6 className="text-primary">
                                Zombies Killed by Player
                              </h6>
                              <h4 className="stat-value">
                                {keyboardStats.zombies_killed_by_player}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-success">Max. Score</h6>
                              <h4 className="stat-value">
                                {keyboardStats.score.toLocaleString()}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-info">Typing Accuracy</h6>
                              <h4 className="stat-value">
                                {keyboardStats.typing_accuracy.toFixed(1)}%
                              </h4>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="stat-item mb-3">
                              <h6 className="text-warning">Levels Completed</h6>
                              <h4 className="stat-value">
                                {keyboardStats.levels_completed}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-info">Total Play Time</h6>
                              <h4 className="stat-value">
                                {formatPlayTime(keyboardStats.total_play_time)}
                              </h4>
                            </div>
                            <div className="stat-item mb-3">
                              <h6 className="text-danger">Bullets Fired</h6>
                              <h4 className="stat-value">
                                {keyboardStats.bullets_fired.toLocaleString()}
                              </h4>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="stat-item mb-3">
                              <h6 className="text-secondary">
                                Environment Kills
                              </h6>
                              <h4 className="stat-value">
                                {keyboardStats.zombies_killed_by_environment}
                              </h4>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <div className="stats-missing-card text-center mb-4">
                        <h5 className="text-success mb-3">⌨️ Keyboard Stats</h5>
                        <p>You haven't played with a keyboard yet!</p>
                        <Button
                          variant="outline-success"
                          className="try-mode-button"
                          onClick={() => navigate("/game")}
                        >
                          Try Keyboard Mode
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h3>🔗 Quick Actions</h3>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={() => navigate("/game")}>
                    Play Game
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => navigate("/leaderboard")}
                  >
                    View Leaderboard
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
