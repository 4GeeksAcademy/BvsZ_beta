import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import ClassSelector from "../components/ClassSelector";
import GameStats from "../components/GameStats";
import { isAuthenticated, getUserProfile, fetchWithAuth } from "../utils/auth";
import { getApiEndpoint } from "../utils/config";
import PhaserGame from "../components/PhaserGame";

interface User {
  id: number;
  email: string;
  username?: string;
  display_name?: string;
}

const Game: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  ////////// PHASER START /////////////
  const phaserRef = useRef(null);
  ////////// PHASER END /////////////

  useEffect(() => {
    const checkAuthAndLoadGame = async () => {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        // Verificar acceso al juego
        const gameResponse = await fetchWithAuth(getApiEndpoint("GAME"));
        if (!gameResponse.ok) {
          navigate("/login");
          return;
        }

        // Obtener datos del usuario
        const profileData = await getUserProfile();
        setUser(profileData.user);

        // Verificar acceso al juego y enviar datos al EventBus
        const gameData = await gameResponse.json();
        if (gameData.game_data.authorized) {
          import("../game/EventBus").then(({ EventBus, USER_EVENT }) => {
            EventBus.emit(USER_EVENT, {
              ...profileData.user,
              ...gameData.game_data,
            });
          });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error verifying game access:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadGame();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Navigation />
        <Container>
          <div className="text-center">Loading...</div>
        </Container>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="row">
          <GameStats phaserRef={phaserRef} />
        </div>
        <div className="row justify-content-center">
          <div className="col-8">
            <PhaserGame ref={phaserRef} />
          </div>
          <div className="col-4">
            <ClassSelector />
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
