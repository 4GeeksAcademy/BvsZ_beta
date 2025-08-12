// src/pages/Leaderboard.tsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import Navigation from "../components/Navigation";
import { getLeaderboardMouse, getLeaderboardKeyboard } from "../utils/auth";

interface LeaderboardEntry {
  username: string;
  score: number;
  zombies_killed_by_player: number;
  zombies_killed_by_environment: number;
  total_play_time: number;
  bullets_fired: number;
  levels_completed: number;
  typing_accuracy?: number; // Solo para keyboard
}

const Leaderboard: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<"mouse" | "keyboard">("mouse");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        if (inputMethod === "mouse") {
          const data = await getLeaderboardMouse();
          setLeaderboard(data.leaderboard);
        } else {
          const data = await getLeaderboardKeyboard();
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(
          "No se pudo cargar la tabla de clasificación. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [inputMethod]);

  return (
    <>
      <Navigation />
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card bg="dark" text="light">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h3>
                  🏆 <span className="text-bootstrap">Bootstrap</span>{" "}
                  <span className="text-vs">vs</span>{" "}
                  <span className="text-zombies">Zombies</span>: Hall of Fame
                </h3>
                <ButtonGroup>
                  <Button
                    variant={inputMethod === "mouse" ? "primary" : "secondary"}
                    onClick={() => setInputMethod("mouse")}
                    className={inputMethod !== "mouse" ? "text-white" : ""}
                  >
                    🖱️ Mouse
                  </Button>
                  <Button
                    variant={
                      inputMethod === "keyboard" ? "primary" : "secondary"
                    }
                    onClick={() => setInputMethod("keyboard")}
                    className={inputMethod !== "keyboard" ? "text-white" : ""}
                  >
                    ⌨️ Keyboard
                  </Button>
                </ButtonGroup>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No data.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>
                          <span className="text-bootstrap">Player</span>
                        </TableHead>
                        <TableHead>Max. Score</TableHead>
                        <TableHead>Zombies Killed</TableHead>
                        <TableHead>Levels Completed</TableHead>
                        {inputMethod === "keyboard" && (
                          <TableHead>Typing Accuracy</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry, index) => (
                        <TableRow key={`${entry.username}-${index}`}>
                          <TableCell>
                            <span>#{index + 1}</span>{" "}
                            {index === 0
                              ? "👑"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : ""}
                          </TableCell>
                          <TableCell>{entry.username}</TableCell>
                          <TableCell className="text-success">
                            <strong>
                              {entry.score.toLocaleString()}
                            </strong>
                          </TableCell>
                          <TableCell>
                            {entry.zombies_killed_by_player.toLocaleString()}
                            <small className="text-muted ms-1">
                              (+{entry.zombies_killed_by_environment} env.)
                            </small>
                          </TableCell>
                          <TableCell>{entry.levels_completed}</TableCell>
                          {inputMethod === "keyboard" && (
                            <TableCell>
                              {entry.typing_accuracy
                                ? `${(entry.typing_accuracy).toFixed(2)}%`
                                : "N/A"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Leaderboard;
