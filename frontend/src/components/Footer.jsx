import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address');
      return;
    }

    setSubscribing(true);
    try {
      // TODO: Replace with actual newsletter endpoint
      await axios.post('/api/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="footer text-light py-5">
      <Container>
        <Row className="g-4">
          {/* Brand Section */}
          <Col lg={4} md={6} className="mb-4">
            <div className="mb-3">
              <img
                src="/Buytopia.png"
                alt="Buytopia"
                className="mb-0"
                style={{
                  height: '120px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
                  marginBottom: '-8px',
                }}
              />
              <p
                className="fw-semibold mb-0"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '1.1rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                }}
              >
                Meet<span className="text-primary">.</span>Shop<span className="text-primary">.</span>Thrive
              </p>
            </div>
            <div className="d-flex gap-3 mb-3">
              <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="mailto:contact@marketplace.com" className="social-icon" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3 text-uppercase fs-6 text-white">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/products" className="footer-link text-white-50 text-decoration-none">Products</a>
              </li>
              <li className="mb-2">
                <a href="/vendors" className="footer-link text-white-50 text-decoration-none">Vendors</a>
              </li>
              <li className="mb-2">
                <a href="/about" className="footer-link text-white-50 text-decoration-none">About Us</a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="footer-link text-white-50 text-decoration-none">Contact</a>
              </li>
              <li className="mb-2">
                <a href="/faq" className="footer-link text-white-50 text-decoration-none">FAQ</a>
              </li>
            </ul>
          </Col>

          {/* Customer Service */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3 text-uppercase fs-6 text-white">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/account" className="footer-link text-white-50 text-decoration-none">My Account</a>
              </li>
              <li className="mb-2">
                <a href="/orders" className="footer-link text-white-50 text-decoration-none">Order Tracking</a>
              </li>
              <li className="mb-2">
                <a href="/returns" className="footer-link text-white-50 text-decoration-none">Returns</a>
              </li>
              <li className="mb-2">
                <a href="/shipping" className="footer-link text-white-50 text-decoration-none">Shipping Info</a>
              </li>
              <li className="mb-2">
                <a href="/privacy" className="footer-link text-white-50 text-decoration-none">Privacy Policy</a>
              </li>
            </ul>
          </Col>

          {/* Newsletter & Contact */}
          <Col lg={4} md={6} className="mb-4">
            <h6 className="fw-bold mb-3 text-uppercase fs-6 text-white">Stay Updated</h6>
            <p className="text-white-50 mb-3">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <Form onSubmit={handleNewsletterSubmit} className="mb-3">
              <div className="input-group">
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input bg-dark text-light border-0"
                  required
                />
                <Button
                  variant="primary"
                  type="submit"
                  className="newsletter-button"
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <span className="spinner-border spinner-border-sm" role="status" />
                  ) : (
                    <>
                      Subscribe <FaPaperPlane className="ms-1" />
                    </>
                  )}
                </Button>
              </div>
            </Form>

            {/* Contact Info */}
            <div className="d-flex flex-column gap-2 mt-3">
              <div className="d-flex align-items-center gap-2 text-white-50">
                <FaEnvelope size={16} />
                <small>hello@soko.co.ke</small>
              </div>
              <div className="d-flex align-items-center gap-2 text-white-50">
                <FaPhone size={16} />
                <small>+254 700 123 456</small>
              </div>
              <div className="d-flex align-items-center gap-2 text-white-50">
                <FaMapMarkerAlt size={16} />
                <small>Westlands, Nairobi, Kenya</small>
              </div>
            </div>
          </Col>
        </Row>

        {/* Copyright Bar */}
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Row className="align-items-center">
          <Col md={6} className="mb-3 mb-md-0">
            <p className="text-white-50 mb-0">
              &copy; {new Date().getFullYear()} Buytopia Marketplace. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="d-flex gap-3 justify-content-md-end">
              <a href="/terms" className="text-white-50 text-decoration-none small">Terms of Service</a>
              <a href="/privacy" className="text-white-50 text-decoration-none small">Privacy Policy</a>
              <a href="/cookies" className="text-white-50 text-decoration-none small">Cookie Policy</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
