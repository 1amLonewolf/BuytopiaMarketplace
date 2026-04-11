import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { FaShoppingCart, FaUser, FaHeart, FaStore, FaBars, FaTimes } from 'react-icons/fa';
import { BsBoxSeam } from 'react-icons/bs';

const NavbarComponent = () => {
  const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
  const { cart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showVendorLink = isAdmin || isVendor;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNavToggle = () => {
    setExpanded(!expanded);
  };

  const handleNavClose = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className={`shadow-sm ${scrolled ? 'scrolled' : ''}`}
      expanded={expanded}
      onToggle={handleNavToggle}
      sticky="top"
    >
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold d-flex align-items-center">
            <img
              src="/Buytopia.png"
              alt="Buytopia"
              style={{
                height: '44px',
                width: '44px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            />
            <div className="ms-2" style={{ width: '100px' }}>
              <span className="d-block text-white fw-bold lh-sm" style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>
                Buytopia
              </span>
              <span className="d-block text-white-50 fw-medium lh-sm" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Marketplace
              </span>
            </div>
          </Navbar.Brand>
        </LinkContainer>

        {/* Mobile Controls (Cart Icon + Hamburger) - Glued Together */}
        <div className="d-lg-none d-flex align-items-center ms-auto">
          <div className="position-relative">
            {cart.totalItems > 0 && (
              <Link to="/cart" className="text-white text-decoration-none position-absolute" style={{ right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <FaShoppingCart size={20} />
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.65rem', padding: '0.25em 0.5em', border: '2px solid transparent' }}
                >
                  {cart.totalItems}
                </span>
              </Link>
            )}

            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="border-0"
              style={{ margin: 0, padding: '0.5rem' }}
            >
              <span style={{ display: 'block' }}>
                {expanded ? <FaTimes size={24} /> : <FaBars size={24} />}
              </span>
            </Navbar.Toggle>
          </div>
        </div>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link onClick={handleNavClose}>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products">
              <Nav.Link onClick={handleNavClose}>Products</Nav.Link>
            </LinkContainer>
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <>
                <LinkContainer to="/cart">
                  <Nav.Link className="position-relative" onClick={handleNavClose}>
                    <FaShoppingCart size={20} />
                    {cart.totalItems > 0 && (
                      <span className="cart-badge">{cart.totalItems}</span>
                    )}
                    <span className="ms-1 d-none d-lg-inline">Cart</span>
                  </Nav.Link>
                </LinkContainer>

                <LinkContainer to="/wishlist">
                  <Nav.Link onClick={handleNavClose}>
                    <FaHeart size={20} />
                    <span className="ms-1 d-none d-lg-inline">Wishlist</span>
                  </Nav.Link>
                </LinkContainer>

                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user?.name}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item onClick={handleNavClose}>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <NavDropdown.Item onClick={handleNavClose}>
                      <BsBoxSeam className="me-2" />
                      My Orders
                    </NavDropdown.Item>
                  </LinkContainer>
                  {showVendorLink && (
                    <LinkContainer to="/vendor/dashboard">
                      <NavDropdown.Item onClick={handleNavClose}>Vendor Dashboard</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  {isAdmin && (
                    <LinkContainer to="/admin/dashboard">
                      <NavDropdown.Item onClick={handleNavClose}>Admin Dashboard</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link onClick={handleNavClose}>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link onClick={handleNavClose}>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
