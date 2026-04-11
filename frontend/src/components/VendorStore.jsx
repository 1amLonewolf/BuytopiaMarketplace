import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';

const VendorStore = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
    fetchProducts();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await axios.get(`/api/vendors/${id}`);
      setVendor(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/vendors/${id}/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vendor products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="mb-4 skeleton" style={{ height: '36px', width: '200px', borderRadius: '8px' }} />
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

  if (!vendor) {
    return (
      <Container className="py-5 text-center">
        <h2>Vendor not found</h2>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Vendor Header */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="text-center">
          {vendor.avatar ? (
            <Image
              src={vendor.avatar}
              roundedCircle
              width="120"
              height="120"
              className="mb-3"
            />
          ) : (
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '120px', height: '120px', fontSize: '48px' }}
            >
              {vendor.name?.charAt(0)}
            </div>
          )}
          
          <h2 className="fw-bold mb-2">{vendor.name}</h2>
          
          {vendor.vendorProfile && (
            <>
              <h4 className="text-muted mb-3">{vendor.vendorProfile.storeName}</h4>
              <p className="text-muted mb-3">{vendor.vendorProfile.storeDescription}</p>
              
              <div className="d-flex justify-content-center gap-4">
                <div>
                  <h5 className="fw-bold mb-0">{vendor.vendorProfile.rating?.toFixed(1) || '0.0'}</h5>
                  <small className="text-muted">Rating</small>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">{vendor.vendorProfile.totalSales || 0}</h5>
                  <small className="text-muted">Sales</small>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Products */}
      <h3 className="fw-bold mb-4">Products from {vendor.name}</h3>
      
      {products.length > 0 ? (
        <Row>
          {products.map(product => (
            <Col key={product._id} md={3} sm={6} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No products available from this vendor yet.</p>
        </div>
      )}
    </Container>
  );
};

export default VendorStore;
