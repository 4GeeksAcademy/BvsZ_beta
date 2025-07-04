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
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Link to="/" className="navbar-brand">
          🧟‍♂️ Bootstrap vs Zombies
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">
              Home
            </Link>
            {user && (
              <Link to="/game" className="nav-link">
                Game
              </Link>
            )}
            <Link to="/leaderboard" className="nav-link">
              Leaderboard
            </Link>
            {user && (
              <>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                {user.email === "sebasmiramontes@gmail.com" && (
                  <Link to="/backend-test" className="nav-link">
                    Backend Test
                  </Link>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light">
                    Welcome, {user.display_name || user.email}!
                  </span>
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
