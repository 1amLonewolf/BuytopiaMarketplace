import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBoxOpen } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'secondary'
    };
    return badges[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="mb-4 skeleton" style={{ height: '36px', width: '150px', borderRadius: '8px' }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div className="skeleton" style={{ width: '120px', height: '18px' }} />
                <div className="skeleton" style={{ width: '80px', height: '18px' }} />
              </div>
              <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '8px' }} />
            </Card.Body>
          </div>
        ))}
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <FaBoxOpen size={60} className="text-muted mb-3" />
        <h2 className="mb-3">No Orders Yet</h2>
        <p className="text-muted mb-4">Start shopping to see your orders here!</p>
        <Link to="/products">
          <Button variant="primary" size="lg">Browse Products</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">My Orders</h1>

      {orders.map(order => (
        <Card key={order._id} className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">Order #{order.orderNumber}</h5>
                <small className="text-muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </small>
              </div>
              <Badge bg={getStatusBadge(order.status)} className="fs-6">
                {order.status.toUpperCase()}
              </Badge>
            </div>

            <hr />

            {order.items.map((item, index) => (
              <Row key={index} className="align-items-center mb-2">
                <Col md={7}>
                  <span>{item.name}</span>
                </Col>
                <Col md={2}>
                  <span className="text-muted">Qty: {item.quantity}</span>
                </Col>
                <Col md={3} className="text-end">
                  <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                </Col>
              </Row>
            ))}

            <hr />

            <div className="d-flex justify-content-between">
              <span className="fw-bold">Total</span>
              <span className="fw-bold fs-5">{formatPrice(order.totalPrice)}</span>
            </div>

            {order.trackingNumber && (
              <div className="mt-2">
                <small className="text-muted">Tracking: {order.trackingNumber}</small>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
