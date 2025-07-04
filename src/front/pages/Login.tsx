import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getApiEndpoint } from "../utils/config";
import { getFilteredCountries } from "../utils/countries";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/profile");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push("Email is invalid");
    }

    if (!password) {
      errors.push("Password is required");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }

    if (isRegister) {
      if (!confirmPassword) {
        errors.push("Password confirmation is required");
      } else if (password !== confirmPassword) {
        errors.push("Passwords do not match");
      }

      if (!username) {
        errors.push("Username is required");
      }

      if (!age) {
        errors.push("Age is required");
      }

      if (!country) {
        errors.push("Country is required");
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const reps = await fetch(getApiEndpoint("REGISTER"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            verify_password: confirmPassword,
            age,
            country,
          }),
        });
        const data = await reps.json();
        if (!reps.ok) throw new Error(data.msg || "Error en el registro");
        setSuccess("¡Register successfully!");
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUsername("");
        setAge("");
        setCountry("");
      } else {
        const response = await fetch(getApiEndpoint("LOGIN"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Error en el inicio de sesión");
        }

        localStorage.setItem("token", data.token);
        setSuccess("¡Login successfull! Redirecting...");
        setTimeout(() => navigate("/profile"), 1500);
      }
    } catch (error) {
      console.error("Auth error:", error);

      // Handle specific error messages
      let errorMessage = "An error occurred during authentication";

      if (error instanceof Error && typeof error.message === "string") {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("User already registered")) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage =
            "Please check your email and click the confirmation link before signing in.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setValidationErrors([]);
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    if (value.trim()) {
      const suggestions = getFilteredCountries(value);
      setCountrySuggestions(suggestions);
      setShowCountrySuggestions(suggestions.length > 0);
    } else {
      setCountrySuggestions([]);
      setShowCountrySuggestions(false);
    }
  };

  const selectCountry = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setCountrySuggestions([]);
    setShowCountrySuggestions(false);
  };

  const handleCountryBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowCountrySuggestions(false);
    }, 200);
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    clearMessages();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setAge("");
    setCountry("");
    setCountrySuggestions([]);
    setShowCountrySuggestions(false);
  };

  return (
    <>
      <Navigation />
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card>
              <Card.Header>
                <h4 className="mb-0 text-center">
                  🧟‍♂️{" "}
                  {isRegister
                    ? "Join the Fight Against Zombies"
                    : "Enter the Battle"}
                </h4>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                {validationErrors.length > 0 && (
                  <Alert variant="warning">
                    <ul className="mb-0">
                      {validationErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {isRegister && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Warrior Name *</Form.Label>
                        <Form.Control
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          className={
                            validationErrors.some((err) =>
                              err.toLowerCase().includes("usuario")
                            )
                              ? "is-invalid"
                              : ""
                          }
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Age *</Form.Label>
                        <Form.Control
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          disabled={loading}
                          className={
                            validationErrors.some((err) =>
                              err.toLowerCase().includes("edad")
                            )
                              ? "is-invalid"
                              : ""
                          }
                        />
                      </Form.Group>
                      <Form.Group className="mb-3 country-autocomplete-container">
                        <Form.Label>Country *</Form.Label>
                        <Form.Control
                          type="text"
                          value={country}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          onFocus={() => {
                            if (country.trim()) {
                              const suggestions = getFilteredCountries(country);
                              setCountrySuggestions(suggestions);
                              setShowCountrySuggestions(suggestions.length > 0);
                            }
                          }}
                          onBlur={handleCountryBlur}
                          disabled={loading}
                          placeholder="Start typing a country name..."
                          autoComplete="off"
                          className={
                            validationErrors.some(
                              (err) =>
                                err.toLowerCase().includes("país") ||
                                err.toLowerCase().includes("country")
                            )
                              ? "is-invalid"
                              : ""
                          }
                        />
                        {showCountrySuggestions &&
                          countrySuggestions.length > 0 && (
                            <ListGroup className="country-suggestions-dropdown">
                              {countrySuggestions.map((suggestion, index) => (
                                <ListGroup.Item
                                  key={index}
                                  action
                                  onClick={() => selectCountry(suggestion)}
                                  className="country-suggestion-item"
                                >
                                  {suggestion}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                      </Form.Group>
                    </>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className={
                        validationErrors.some((err) => err.includes("Email"))
                          ? "is-invalid"
                          : ""
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password *</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className={
                          validationErrors.some(
                            (err) =>
                              err.toLowerCase().includes("contraseña") ||
                              err.toLowerCase().includes("password")
                          )
                            ? "is-invalid"
                            : ""
                        }
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        disabled={loading}
                      >
                        {showPassword ? "Hide" : "See"}
                      </Button>
                    </InputGroup>
                    {isRegister && (
                      <Form.Text className="text-muted">
                        La contraseña debe tener al menos 8 caracteres.
                      </Form.Text>
                    )}
                  </Form.Group>
                  {isRegister && (
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm password *</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          className={
                            validationErrors.some(
                              (err) =>
                                err.toLowerCase().includes("confirm") ||
                                err.toLowerCase().includes("match")
                            )
                              ? "is-invalid"
                              : ""
                          }
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          disabled={loading}
                        >
                          {showPassword ? "Hide" : "See"}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading
                      ? "Loading..."
                      : isRegister
                      ? "Registrarse"
                      : "Entrar"}
                  </Button>
                </Form>
                {!isRegister && (
                  <div className="text-center mb-3">
                    <a href="/forgot-password">Forgot your password?</a>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={switchMode}
                    className="switch-mode-button"
                    disabled={loading}
                  >
                    {isRegister
                      ? "Already a warrior? Sign in here"
                      : "New recruit? Join the fight"}
                  </Button>
                </div>

                {isRegister && (
                  <div className="mt-3">
                    <small className="text-muted">
                      <strong>Note:</strong> You'll receive a confirmation email
                      after registration. Click the link in the email to
                      activate your account.
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
