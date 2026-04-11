import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhoneAlt, FaLock } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    building: '',
    city: user?.address?.city || '',
    county: user?.address?.state || '',
    country: user?.address?.country || 'Kenya',
    paymentMethod: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('success')) {
      // Redirected from Stripe success page
      clearCart();
      navigate('/orders');
      return;
    }

    if (params.get('canceled')) {
      toast.info('Payment was canceled. Your cart is still available.');
    }
  }, [navigate, clearCart]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // If card payment, redirect to Stripe Checkout
      if (formData.paymentMethod === 'card') {
        const orderData = {
          items: cart.items.map(item => ({
            product: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            vendor: item.vendor
          })),
          shippingAddress: {
            name: formData.name,
            street: formData.street + (formData.building ? `, ${formData.building}` : ''),
            city: formData.city,
            state: formData.county,
            country: formData.country,
            phone: formData.phone
          }
        };

        const response = await axios.post('/api/orders/checkout-session', orderData);
        window.location.href = response.data.url;
        return;
      }

      // Cash on Delivery flow
      const orderData = {
        items: cart.items.map(item => ({
          product: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: formData.name,
          street: formData.street + (formData.building ? `, ${formData.building}` : ''),
          city: formData.city,
          state: formData.county,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: 'cod'
      };

      await axios.post('/api/orders', orderData);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const total = cart.totalPrice + (cart.totalPrice > 50 ? 0 : 10);

  const cardStyle = {
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  };

  const getPaymentCardStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: active ? '2px solid #6366f1' : '2px solid #e5e7eb',
    backgroundColor: active ? 'rgba(99, 102, 241, 0.08)' : '#fafafa',
    cursor: 'pointer',
    flex: '1 1 auto',
    minWidth: '140px',
    transition: 'all 0.2s ease',
    boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'
  });

  return (
    <div className="checkout-page" style={{
      position: 'relative',
      minHeight: '100vh',
      paddingBottom: '3rem'
    }}>
      {/* Background layer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2ff 100%)',
        zIndex: 0
      }} />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '2rem' }}>
        <Container className="py-4">
        {/* Page Header */}
        <div className="d-flex align-items-center mb-4 fade-in-up">
          <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)'
          }}>
            <FaLock className="text-white" size={20} />
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
              Secure Checkout
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              Complete your order safely and securely
            </p>
          </div>
        </div>

        {error && <Alert variant="danger" className="fade-in">{error}</Alert>}

        <Row className="g-4">
          {/* Shipping Information */}
          <Col lg={7}>
            <Card className="h-100" style={cardStyle}>
              <Card.Body className="p-4">
                {/* Section Header */}
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  }}>
                    <FaMapMarkerAlt className="text-white" size={16} />
                  </div>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
                    Shipping Information
                  </h4>
                </div>

                <Form id="checkout-form" onSubmit={handleSubmit}>
                  <Row className="g-3">
                    {/* Full Name */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="e.g. John Kamau"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Phone */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          <FaPhoneAlt className="me-1" size={12} />
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="e.g. 0712 345 678 or +254 712 345 678"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Street Address */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="street"
                          placeholder="e.g. Moi Avenue"
                          value={formData.street}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Building/Apartment */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          Building / House No. / Estate <span className="text-muted fw-normal">(optional)</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="building"
                          placeholder="e.g. Westlands Towers, Apt 4B"
                          value={formData.building}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    {/* City & County */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Town / City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          placeholder="e.g. Nairobi"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>County</Form.Label>
                        <Form.Control
                          type="text"
                          name="county"
                          placeholder="e.g. Nairobi County"
                          value={formData.county}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Country (pre-filled) */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    {/* Payment Method */}
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="fw-bold mb-2">Payment Method</Form.Label>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {[
                            { value: 'mpesa', label: 'M-Pesa', img: '/mpesa.svg' },
                            { value: 'card', label: 'Card', img: '/card.svg' },
                            { value: 'cod', label: 'Cash on Delivery', img: '/cod.svg' }
                          ].map(method => (
                            <label
                              key={method.value}
                              style={getPaymentCardStyle(formData.paymentMethod === method.value)}
                              onMouseEnter={(e) => {
                                if (formData.paymentMethod !== method.value) {
                                  e.currentTarget.style.borderColor = '#c4b5fd';
                                  e.currentTarget.style.backgroundColor = '#faf5ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (formData.paymentMethod !== method.value) {
                                  e.currentTarget.style.borderColor = '#e5e7eb';
                                  e.currentTarget.style.backgroundColor = '#fafafa';
                                }
                              }}
                            >
                              <Form.Check
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={formData.paymentMethod === method.value}
                                onChange={handleChange}
                                required
                              />
                              <img
                                src={method.img}
                                alt={method.label}
                                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
                              />
                              <span className="fw-semibold" style={{ fontSize: '0.875rem' }}>{method.label}</span>
                            </label>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={5}>
            <Card style={cardStyle}>
              <Card.Body className="p-4">
                {/* Section Header */}
                <div className="d-flex align-items-center mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #10b981, #059669)'
                  }}>
                    <span className="text-white fw-bold" style={{ fontSize: '0.875rem' }}>₿</span>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ fontSize: '1.25rem' }}>
                    Order Summary
                  </h4>
                </div>

                {/* Items List */}
                <div className="mb-3">
                  {cart.items.map(item => (
                    <div key={item.productId} className="d-flex justify-content-between align-items-center py-2 mb-2" style={{
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <div>
                        <span className="fw-medium" style={{ fontSize: '0.875rem' }}>{item.name}</span>
                        <br />
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <span className="fw-bold" style={{ fontSize: '0.875rem' }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="p-3 rounded-3" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>Subtotal</span>
                    <span className="fw-medium">{formatPrice(cart.totalPrice)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>Shipping</span>
                    <span className={`fw-medium ${cart.totalPrice > 50 ? 'text-success' : ''}`}>
                      {cart.totalPrice > 50 ? 'FREE' : formatPrice(10)}
                    </span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{ fontSize: '1rem' }}>Total</span>
                    <span className="fw-bold" style={{
                      fontSize: '1.25rem',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  form="checkout-form"
                  variant="primary"
                  size="lg"
                  className="w-100 mt-4"
                  disabled={loading || cart.items.length === 0}
                  style={{
                    borderRadius: '12px',
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.35)';
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Processing...
                    </>
                  ) : (
                    `Place Order — ${formatPrice(total)}`
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-center mt-3">
                  <small className="text-muted">
                    <FaLock className="me-1" size={10} />
                    Your payment information is encrypted and secure
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>
    </div>
  );
};

export default Checkout;
