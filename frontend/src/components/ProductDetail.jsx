import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button, Card, Form } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/product/${id}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row>
          <Col lg={6}>
            <div className="skeleton-card">
              <div className="skeleton-image" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-4 skeleton" style={{ height: '36px', width: '80%', borderRadius: '8px' }} />
            <div className="mb-3 skeleton" style={{ height: '18px', width: '40%' }} />
            <div className="mb-3 skeleton" style={{ height: '28px', width: '30%' }} />
            <div className="mb-4 skeleton" style={{ height: '60px', width: '100%', borderRadius: '8px' }} />
            <div className="mb-3 skeleton" style={{ height: '18px', width: '50%' }} />
            <div className="mb-3 skeleton" style={{ height: '18px', width: '40%' }} />
            <div className="mt-4 skeleton" style={{ height: '48px', width: '200px', borderRadius: '8px' }} />
          </Col>
        </Row>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary mt-3">Back to Products</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        {/* Product Image */}
        <Col lg={6}>
          {product.images && product.images.length > 0 ? (
            <Image src={product.images[0]} fluid className="rounded" />
          ) : (
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
              <span className="text-muted">No Image Available</span>
            </div>
          )}
        </Col>

        {/* Product Info */}
        <Col lg={6}>
          <h1 className="fw-bold mb-3">{product.name}</h1>
          
          {product.vendor && (
            <p className="text-muted mb-3">
              by <Link to={`/vendor/${product.vendor._id}`}>{product.vendor.name}</Link>
            </p>
          )}

          {product.rating > 0 && (
            <div className="mb-3">
              <FaStar className="rating" />
              <span className="ms-1">{product.rating.toFixed(1)}</span>
              <span className="text-muted ms-1">({product.numReviews} reviews)</span>
            </div>
          )}

          <div className="mb-3">
            <h2 className="price mb-2">{formatPrice(product.price)}</h2>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-muted text-decoration-line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-muted mb-4">{product.description}</p>

          <div className="mb-3">
            <strong>Category:</strong> {product.category}
            {product.subcategory && ` > ${product.subcategory}`}
          </div>

          <div className="mb-3">
            <strong>Availability:</strong>{' '}
            {product.inventory > 0 ? (
              <span className="text-success">{product.inventory} in stock</span>
            ) : (
              <span className="text-danger">Out of stock</span>
            )}
          </div>

          {product.inventory > 0 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={product.inventory}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{ width: '100px' }}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" size="lg" onClick={handleAddToCart}>
                  <FaShoppingCart className="me-2" />
                  Add to Cart
                </Button>
                <Button variant="outline-secondary" size="lg">
                  <FaHeart />
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>

      {/* Reviews Section */}
      <Row className="mt-5 pt-4 section-fade-top">
        <Col>
          <h3 className="fw-bold mb-4">Reviews ({reviews.length})</h3>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <Card key={review._id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{review.user?.name}</strong>
                      {review.isVerifiedPurchase && (
                        <span className="badge bg-success ms-2">Verified Purchase</span>
                      )}
                    </div>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? 'rating' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <h5>{review.title}</h5>
                  <p className="mb-0">{review.comment}</p>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
