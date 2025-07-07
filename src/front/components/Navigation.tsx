import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, signOut, getUserProfile } from "../utils/auth";

interface User {
  id: number;
  email: string;
  username?: string;
  display_name?: string;
}

const Navigation: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para manejar navegación y cleanup
  const handleNavigation = (path: string) => {
    console.log(`Navegando de ${window.location.pathname} a ${path}`);
    navigate(path);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated()) {
        try {
          const profileData = await getUserProfile();
          setUser(profileData.user);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          signOut();
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top mb-2">
      <Container>
        <Link to="/" className="navbar-brand p-0 m-0">
          {"<"}
          🧟‍♂️ <span className="text-bootstrap">B</span>
          {""}
          <span className="text-vs">vs</span>
          {""}
          <span className="text-zombies">Z</span> {"/>"}
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <button
              type="button"
              className="nav-link btn btn-link p-0"
              onClick={() => handleNavigation("/")}
            >
              Home
            </button>
            {user && (
              <button
                type="button"
                className="nav-link btn btn-link p-0"
                onClick={() => handleNavigation("/game")}
              >
                Game
              </button>
            )}
            <button
              type="button"
              className="nav-link btn btn-link p-0"
              onClick={() => handleNavigation("/leaderboard")}
            >
              Leaderboard
            </button>
            {user && (
              <>
                <button
                  type="button"
                  className="nav-link btn btn-link p-0"
                  onClick={() => handleNavigation("/profile")}
                >
                  Profile
                </button>
              </>
            )}
          </Nav>

          <Nav>
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light">{user.username}</span>
                </Nav.Item>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline-light" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
