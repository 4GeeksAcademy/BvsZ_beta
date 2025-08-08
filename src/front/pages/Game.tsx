import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { isAuthenticated, fetchWithAuth } from "../utils/auth";
import { getApiEndpoint } from "../utils/config";
import PhaserGame from "../game/PhaserGame";
import { EventBus, USER_EVENT } from "../game/EventBus";

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
        const profileResponse = await fetchWithAuth(getApiEndpoint("PROFILE"));
        const profileData = await profileResponse.json();
        setUser(profileData.user);

        // Verificar acceso al juego y enviar datos al EventBus
        const gameData = await gameResponse.json();
        if (gameData.game_data.authorized) {
          EventBus.emit(USER_EVENT, {
            ...profileData.user,
            ...gameData.game_data,
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

    // Cleanup function que se ejecuta cuando el componente se desmonta
    return () => {
      // Limpiar EventBus y notificar a Phaser que se está saliendo del juego
      EventBus.emit("game:cleanup");
    };
  }, [navigate]);

  if (loading) {
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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Navigation />
      <PhaserGame ref={phaserRef} />
    </>
  );
};

export default Game;
