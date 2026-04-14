import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer when rate limited
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && rateLimited) {
      setRateLimited(false);
    }
  }, [countdown, rateLimited]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Block if still rate limited
    if (rateLimited && countdown > 0) {
      toast.warn(`Please wait ${formatCountdown(countdown)} before trying again.`);
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      const user = response?.data;

      if (user && user.name) {
        const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');

        if (hasLoggedInBefore === user._id) {
          toast.success(`Welcome back, ${user.name}!`);
        } else {
          toast.success(`Welcome, ${user.name}!`);
          localStorage.setItem('hasLoggedInBefore', user._id);
        }
      } else {
        toast.success('Login successful!');
      }

      setRateLimited(false);
      setCountdown(0);
      navigate('/products');
    } catch (err) {
      console.error('Login error:', err);

      // Handle rate limiting (429)
      if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after']) || 900; // Default 15 min
        setRateLimited(true);
        setCountdown(retryAfter);

        const errorMsg = `Too many login attempts. Please wait ${formatCountdown(retryAfter)} before trying again.`;
        setError(errorMsg);
        toast.error(errorMsg, { autoClose: 10000 });
      } else {
        setRateLimited(false);
        const errorMsg = err.response?.data?.message || 'Network error or server offline';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center fw-bold mb-4">Login</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={loading || (rateLimited && countdown > 0)}
                >
                  {rateLimited && countdown > 0
                    ? `Try again in ${formatCountdown(countdown)}`
                    : loading
                    ? 'Logging in...'
                    : 'Login'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Register here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
