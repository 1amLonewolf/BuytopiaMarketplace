import React from 'react';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      toast.info('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    toast.info('Item removed from cart');
  };

  if (cart.items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2 className="mb-3">Your Cart is Empty</h2>
        <p className="text-muted mb-4">Add some products to get started!</p>
        <Link to="/products">
          <Button variant="primary" size="lg">
            Browse Products
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">Shopping Cart</h1>
      
      <Row>
        <Col lg={8}>
          {cart.items.map(item => (
            <Card key={item.productId} className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={2}>
                    {item.image ? (
                      <Image src={item.image} fluid rounded style={{ height: '80px', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-light rounded" style={{ height: '80px' }} />
                    )}
                  </Col>
                  
                  <Col md={4}>
                    <h5 className="mb-1">{item.name}</h5>
                    <p className="text-muted mb-0">{formatPrice(item.price)} each</p>
                  </Col>
                  
                  <Col md={3}>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      >
                        <FaMinus />
                      </Button>
                      <span className="fw-bold">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={2}>
                    <span className="fw-bold">{formatPrice(item.price * item.quantity)}</span>
                  </Col>
                  
                  <Col md={1} className="text-center">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemove(item.productId)}
                      style={{ minWidth: '36px' }}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h4 className="fw-bold mb-3">Order Summary</h4>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Items ({cart.totalItems})</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>{cart.totalPrice > 50 ? 'FREE' : formatPrice(10)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold fs-4">
                  {formatPrice(cart.totalPrice + (cart.totalPrice > 50 ? 0 : 10))}
                </span>
              </div>
              
              <Link to="/checkout">
                <Button variant="primary" size="lg" className="w-100">
                  Proceed to Checkout
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
