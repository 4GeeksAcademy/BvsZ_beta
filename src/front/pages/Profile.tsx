import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getApiEndpoint } from "../utils/config";

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  email: string;
}

interface GameStats {
  total_games: number;
  high_score: number;
  total_score: number;
  levels_completed: number;
  zombies_defeated: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const token = localStorage.getItem("token");

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
      setProfile(data.user);
      setDisplayName(data.user.username || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to fetch profile" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [token, navigate, fetchProfile]);

  // Placeholder para cuando implementemos las estadísticas
  const fetchGameStats = async () => {
    setGameStats({
      total_games: 0,
      high_score: 0,
      total_score: 0,
      levels_completed: 0,
      zombies_defeated: 0,
    });
  };

  const updateProfile = async () => {
    if (!token || !profile) return;

    setIsLoading(true);
    try {
      const res = await fetch(getApiEndpoint("PROFILE"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!res.ok) throw new Error("request failed");

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <Container>
          <div className="text-center">Loading...</div>
        </Container>
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
          <Col lg={8}>
            <h2 className="mb-4">👤 User Profile</h2>

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
                <h5>Profile Information</h5>
              </Card.Header>
              <Card.Body>
                {profile ? (
                  <div>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Email:</strong> {profile.email}
                        </p>
                        <p>
                          <strong>Member Since:</strong>{" "}
                          {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>User ID:</strong> {profile.id}
                        </p>
                      </Col>
                      <Col md={6}>
                        {isEditing ? (
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>Display Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                              />
                            </Form.Group>
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                onClick={updateProfile}
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setIsEditing(false);
                                  setDisplayName(profile.display_name);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </Form>
                        ) : (
                          <div>
                            <p>
                              <strong>Display Name:</strong>{" "}
                              {profile.display_name}
                            </p>
                            <Button
                              variant="outline-primary"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit Profile
                            </Button>
                          </div>
                        )}
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
                <h5>🎮 Game Statistics</h5>
              </Card.Header>
              <Card.Body>
                {gameStats ? (
                  <Row>
                    <Col md={6}>
                      <div className="stat-item mb-3">
                        <h6 className="text-primary">Total Games Played</h6>
                        <h4>{gameStats.total_games}</h4>
                      </div>
                      <div className="stat-item mb-3">
                        <h6 className="text-success">High Score</h6>
                        <h4>{gameStats.high_score.toLocaleString()}</h4>
                      </div>
                      <div className="stat-item mb-3">
                        <h6 className="text-info">Total Score</h6>
                        <h4>{gameStats.total_score.toLocaleString()}</h4>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="stat-item mb-3">
                        <h6 className="text-warning">Levels Completed</h6>
                        <h4>{gameStats.levels_completed}</h4>
                      </div>
                      <div className="stat-item mb-3">
                        <h6 className="text-danger">Zombies Defeated</h6>
                        <h4>{gameStats.zombies_defeated.toLocaleString()}</h4>
                      </div>
                      <div className="stat-item mb-3">
                        <h6 className="text-secondary">Average Score</h6>
                        <h4>
                          {gameStats.total_games > 0
                            ? Math.round(
                                gameStats.total_score / gameStats.total_games
                              ).toLocaleString()
                            : "0"}
                        </h4>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <div className="text-center">
                    <p>No game statistics yet!</p>
                    <p>
                      Play some games or use the <strong>Backend Test</strong>{" "}
                      page to add test scores.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5>🔗 Quick Actions</h5>
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
                  <Button
                    variant="info"
                    onClick={() => navigate("/backend-test")}
                  >
                    Backend Test
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
