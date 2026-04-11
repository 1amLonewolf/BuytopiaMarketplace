import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get('/api/wishlist');
      setWishlist(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="mb-4 skeleton" style={{ height: '36px', width: '150px', borderRadius: '8px' }} />
        <Row>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Col key={i} md={3} sm={6} className="mb-4">
              <div className="skeleton-card">
                <div className="skeleton-image" />
                <Card.Body>
                  <div className="skeleton skeleton-title mb-2" style={{ width: '80%' }} />
                  <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '6px' }} />
                </Card.Body>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Container className="py-5 text-center">
        <FaHeart size={60} className="text-muted mb-3" />
        <h2 className="mb-3">Your Wishlist is Empty</h2>
        <p className="text-muted mb-4">Save products you love to your wishlist!</p>
        <a href="/products" className="btn btn-primary btn-lg">Browse Products</a>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">My Wishlist</h1>
      <p className="text-muted mb-4">{wishlist.length} items in your wishlist</p>

      <Row>
        {wishlist.map(product => (
          <Col key={product._id} md={3} sm={6} className="mb-4">
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Wishlist;
