import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import Reveal from './Reveal.jsx';
import { 
  FaArrowRight, FaStore, FaTruck, FaHeadset, FaShieldAlt, 
  FaPercent, FaShippingFast, FaCheckCircle, FaGift, FaStar 
} from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, recentRes] = await Promise.all([
        axios.get('/api/products/featured'),
        axios.get('/api/products?sort=createdAt:desc&limit=5')
      ]);

      setFeaturedProducts(featuredRes.data.data || []);
      setRecentProducts(recentRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Announcement Bar */}
      <div className="promo-bar text-center py-2">
        <Container>
          <small className="fw-semibold">
            <FaGift className="me-2" />
            Free delivery in Nairobi on orders over KSh 5,000 | Use code <strong>SOKO20</strong> for 20% off
          </small>
        </Container>
      </div>

      {/* Hero Section */}
      <div className="hero-section-new">
        <div className="hero-overlay"></div>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center min-vh-75">
            <Col lg={7} className="hero-content fade-in-up">
              {/* Badge */}
              <div className="hero-badge mb-3">
                <FaStar className="me-2" />
                Kenya's Multi-Vendor Marketplace
              </div>

              {/* Main Heading */}
              <h1 className="hero-title mb-3">
                Shop Smarter.<br />
                <span className="text-gradient">Sell Smarter.</span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle mb-4">
                Unasaka deals ngori ama kuelevate mboka yako? Link up on Buytopia Marketplace to get legit vendors and clients.
                Discover vitu fresh, score deals poa and level up your hustle — simple, safe and stress-free.
              </p>
              
              {/* CTA Buttons */}
              <div className="d-flex gap-3 flex-wrap mb-5">
                <Link to="/products">
                  <Button className="btn-hero-primary btn-lg fw-bold">
                    Shop Now <FaArrowRight className="ms-2" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-hero-secondary btn-lg fw-bold">
                    Start Selling
                  </Button>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="hero-stats d-flex gap-4 gap-md-5 flex-wrap">
                <div className="stat-item">
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Wateja (Customers)</div>
                </div>
                <div className="stat-divider d-none d-md-block"></div>
                <div className="stat-item">
                  <div className="stat-number">
                    4.9 <FaStar className="stat-star" />
                  </div>
                  <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-divider d-none d-md-block"></div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Premium Products</div>
                </div>
              </div>
            </Col>

            {/* Animated Logo */}
            <Col lg={5} className="d-none d-lg-flex justify-content-center align-items-center">
              <div className="hero-icon-wrapper">
                <img
                  src="/Buytopia.png"
                  alt="Buytopia"
                  className="hero-icon"
                  style={{ height: '300px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </Col>
          </Row>

          {/* Trust Badges */}
          <Row className="trust-badges-row">
            <Col md={6}>
              <div className="trust-badge glass-card">
                <div className="trust-badge-icon purple">
                  <FaGift />
                </div>
                <div className="trust-badge-text">
                  <strong>Free Delivery</strong>
                  <small>On orders over KSh 5,000</small>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="trust-badge glass-card">
                <div className="trust-badge-icon green">
                  <FaCheckCircle />
                </div>
                <div className="trust-badge-text">
                  <strong>Lipa na M-Pesa</strong>
                  <small>Safe & instant payment</small>
                </div>
              </div>
            </Col>
          </Row>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span>SCROLL</span>
            <div className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </div>
          </div>
        </Container>
      </div>

      {/* Features */}
      <div className="features-section">
        <Container className="py-5 section-fade-bottom">
          <div className="section-header mb-5 text-center">
            <h2 className="fw-bold mb-2">Why Choose <span className="text-gradient">Buytopia</span>?</h2>
            <p className="text-muted">Here's what makes us different from the rest</p>
          </div>

          <Row className="g-4">
            <Col md={4} className="fade-in-up stagger-1">
              <Card className="text-center h-100 feature-card border-0">
                <Card.Body className="p-4">
                  <FaStore size={48} className="text-primary mb-3 feature-icon" />
                  <h5 className="fw-bold mb-2">Wenyeji Vendors</h5>
                  <p className="text-muted mb-0">
                    Shop from verified Kenyan vendors - from Nairobi CBD to Westlands.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="fade-in-up stagger-2">
              <Card className="text-center h-100 feature-card border-0">
                <Card.Body className="p-4">
                  <FaTruck size={48} className="text-primary mb-3 feature-icon" />
                  <h5 className="fw-bold mb-2">Fast Delivery</h5>
                  <p className="text-muted mb-0">
                    Same-day delivery in Nairobi. Nationwide via Wells Fargo, G4S & more.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="fade-in-up stagger-3">
              <Card className="text-center h-100 feature-card border-0">
                <Card.Body className="p-4">
                  <FaHeadset size={48} className="text-primary mb-3 feature-icon" />
                  <h5 className="fw-bold mb-2">24/7 Support</h5>
                  <p className="text-muted mb-0">
                    Call, WhatsApp or chat - we're always here to help, rafiki.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional Trust Features */}
          <Row className="g-4 mt-4">
            <Col md={6} className="fade-in-up stagger-4">
            <Card className="feature-card border-0 text-center">
              <Card.Body className="p-4">
                <FaShieldAlt size={40} className="text-success mb-3" />
                <h5 className="fw-bold mb-2">Lipa na M-Pesa</h5>
                <p className="text-muted mb-0">
                  Pay safely with M-Pesa, Airtel Money, or card. Hakuna stress.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="fade-in-up stagger-4">
            <Card className="feature-card border-0 text-center">
              <Card.Body className="p-4">
                <FaPercent size={40} className="text-warning mb-3" />
                <h5 className="fw-bold mb-2">Bei Nafuu (Best Deals)</h5>
                <p className="text-muted mb-0">
                  Competitive prices and exclusive offers from local vendors.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>

      {/* Featured Products — Horizontal Layout */}
      {featuredProducts.length > 0 && (
        <Reveal>
        <Container className="py-5 section-fade-both fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">
              <span className="text-primary">Featured</span> Products
            </h2>
            <Link to="/products" className="btn btn-outline-primary">
              View All <FaArrowRight className="ms-2" />
            </Link>
          </div>
          <div className="horizontal-products-scroll">
            <div className="horizontal-scroll-track" style={{ paddingBottom: '0.5rem' }}>
              {featuredProducts.map((product) => (
                <div key={product._id} className="horizontal-product-card flex-shrink-0">
                  <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
                    <div className="horizontal-product-image">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="placeholder-img d-flex align-items-center justify-content-center bg-light">
                          <FaShippingFast size={40} className="text-muted" />
                        </div>
                      )}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="discount-badge">-{Math.round((1 - product.price / product.compareAtPrice) * 100)}%</span>
                      )}
                      {product.isFeatured && (
                        <span className="featured-badge">★ Featured</span>
                      )}
                    </div>
                    <div className="horizontal-product-info">
                      <h6 className="fw-semibold mb-1 text-truncate" style={{ maxWidth: '180px' }} title={product.name}>
                        {product.name}
                      </h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="price-text fw-bold">KSh {product.price.toLocaleString()}</span>
                        {product.compareAtPrice && (
                          <del className="text-muted small">KSh {product.compareAtPrice.toLocaleString()}</del>
                        )}
                      </div>
                      {product.rating > 0 && (
                        <div className="d-flex align-items-center gap-1 mt-1">
                          <FaStar className="text-warning" size={12} />
                          <small className="text-muted">{product.rating.toFixed(1)} ({product.numReviews})</small>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Container>
        </Reveal>
      )}

      {/* Recent Products — Horizontal Layout */}
      <Reveal>
      <Container className="py-5 section-fade-top fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            <span className="text-primary">New</span> Arrivals
          </h2>
          <Link to="/products" className="btn btn-outline-primary">
            View All <FaArrowRight className="ms-2" />
          </Link>
        </div>
        <div className="horizontal-products-scroll">
          <div className="horizontal-scroll-track" style={{ paddingBottom: '0.5rem' }}>
            {recentProducts.map((product) => (
              <div key={product._id} className="horizontal-product-card flex-shrink-0">
                <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
                  <div className="horizontal-product-image">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="placeholder-img d-flex align-items-center justify-content-center bg-light">
                        <FaShippingFast size={40} className="text-muted" />
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="discount-badge">-{Math.round((1 - product.price / product.compareAtPrice) * 100)}%</span>
                    )}
                  </div>
                  <div className="horizontal-product-info">
                    <h6 className="fw-semibold mb-1 text-truncate" style={{ maxWidth: '180px' }} title={product.name}>
                      {product.name}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className="price-text fw-bold">KSh {product.price.toLocaleString()}</span>
                      {product.compareAtPrice && (
                        <del className="text-muted small">KSh {product.compareAtPrice.toLocaleString()}</del>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div className="d-flex align-items-center gap-1 mt-1">
                        <FaStar className="text-warning" size={12} />
                        <small className="text-muted">{product.rating.toFixed(1)} ({product.numReviews})</small>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>
      </Reveal>
    </div>
  );
};

export default Home;
