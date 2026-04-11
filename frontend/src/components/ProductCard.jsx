import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar, FaEye, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    checkWishlistStatus();
  }, [product._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get('/api/wishlist');
      const wishlistItems = response.data.data || [];
      setIsInWishlist(wishlistItems.some(item => item._id === product._id));
    } catch (error) {
      // User might not be logged in
      setIsInWishlist(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (wishlistLoading) return;
    
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete(`/api/wishlist/${product._id}`);
        setIsInWishlist(false);
        toast.info('Removed from wishlist');
      } else {
        await axios.post(`/api/wishlist/${product._id}`);
        setIsInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discount = ((product.compareAtPrice - product.price) / product.compareAtPrice * 100).toFixed(0);
      return `-${discount}%`;
    }
    return null;
  };

  const isNew = () => {
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 7;
  };

  return (
    <Card className="product-card h-100">
      <Link to={`/products/${product._id}`} className="text-decoration-none d-block">
        <div className="product-image-wrapper">
          {!imageLoaded && (
            <div className="skeleton-image" />
          )}
          {product.images && product.images.length > 0 ? (
            <Card.Img
              variant="top"
              src={product.images[0]}
              className="product-image"
              alt={product.name}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="product-image bg-light d-flex align-items-center justify-content-center">
              <span className="text-muted">No Image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="d-flex flex-column gap-2">
            {product.isFeatured && (
              <span className="product-badge badge-featured">Featured</span>
            )}
            {calculateDiscount() && (
              <span className="product-badge badge-sale">{calculateDiscount()}</span>
            )}
            {isNew() && !product.isFeatured && (
              <span className="product-badge badge-new">New</span>
            )}
            {product.inventory === 0 && (
              <span className="product-badge badge-out-of-stock">Sold Out</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            className={`wishlist-button ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'adding' : ''}`}
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FaHeart />
          </button>

          {/* Quick View Overlay */}
          <div className="quick-view-overlay">
            <Link 
              to={`/products/${product._id}`}
              className="quick-view-button"
            >
              <FaEye className="me-2" />
              Quick View
            </Link>
          </div>
        </div>
      </Link>

      <Card.Body className="d-flex flex-column">
        <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
          <Card.Title className="fw-bold mb-2" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
            {product.name.length > 50 ? product.name.substring(0, 50) + '...' : product.name}
          </Card.Title>
        </Link>

        {product.vendor && product.vendor.vendorProfile && (
          <small className="text-muted mb-2">
            by <Link to={`/vendor/${product.vendor._id}`} className="text-decoration-none fw-medium">{product.vendor.name}</Link>
          </small>
        )}

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="price">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <small className="text-muted text-decoration-line-through">
                {formatPrice(product.compareAtPrice)}
              </small>
            )}
          </div>

          {product.rating > 0 && (
            <div className="mb-2 d-flex align-items-center">
              <FaStar className="rating" />
              <span className="ms-1 fw-medium">{product.rating.toFixed(1)}</span>
              <small className="text-muted ms-1">({product.numReviews})</small>
            </div>
          )}

          <Button
            variant="primary"
            className="w-100"
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
          >
            {product.inventory === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <FaShoppingCart className="me-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
