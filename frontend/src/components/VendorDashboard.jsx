import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import Reveal from './Reveal.jsx';
import { FaBox, FaDollarSign, FaShoppingBag, FaPlus, FaEdit, FaTrash, FaTimes, FaChartLine } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [analyticsRange, setAnalyticsRange] = useState('30');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    inventory: '',
    category: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchProducts();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/vendors/analytics?range=${analyticsRange}`);
      setAnalytics(response.data.data || []);
      setTopProducts(response.data.topProducts || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleRangeChange = (range) => {
    setAnalyticsRange(range);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [analyticsRange]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/vendors/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductData({
        name: product.name,
        description: product.description,
        price: product.price,
        inventory: product.inventory,
        category: product.category,
        images: product.images || []
      });
    } else {
      setEditingProduct(null);
      setProductData({
        name: '',
        description: '',
        price: '',
        inventory: '',
        category: '',
        images: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/products', productData);
        toast.success('Product created successfully!');
      }
      setShowModal(false);
      fetchProducts();
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = 5 - productData.images.length;
    if (remaining <= 0) {
      toast.warning('Maximum 5 images per product');
      return;
    }

    if (files.length > remaining) {
      toast.warning(`You can only upload ${remaining} more image(s)`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post('/api/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrls = response.data.data;
      setProductData(prev => ({
        ...prev,
        images: [...prev.images, ...newUrls]
      }));
      toast.success(`${newUrls.length} image(s) uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
        fetchDashboard();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
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
        <div className="mb-4 skeleton" style={{ height: '36px', width: '200px', borderRadius: '8px' }} />
        <Row className="g-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Col md={3} sm={6} key={i}>
              <div className="skeleton-card">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, marginRight: '12px' }} />
                    <div>
                      <div className="skeleton" style={{ width: '60px', height: '24px', marginBottom: '6px' }} />
                      <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          ))}
        </Row>
        <div className="skeleton-card">
          <Card.Body className="p-4">
            <div className="skeleton skeleton-title mb-3" style={{ width: '180px' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton" style={{ width: '100%', height: '48px', marginBottom: '8px', borderRadius: '6px' }} />
            ))}
          </Card.Body>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Vendor Dashboard</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaPlus className="me-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <Reveal>
      <Row className="mb-4 section-fade-bottom">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaBox size={30} className="text-primary me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.totalProducts}</h3>
                  <small className="text-muted">Total Products</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaShoppingBag size={30} className="text-success me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.totalSales}</h3>
                  <small className="text-muted">Total Sales</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaDollarSign size={30} className="text-warning me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{formatPrice(stats?.totalRevenue)}</h3>
                  <small className="text-muted">Revenue</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaBox size={30} className="text-info me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.activeProducts}</h3>
                  <small className="text-muted">Active Products</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Reveal>

      {/* Vendor Progress - Analytics Chart */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body className="p-4">
          {/* Header with Range Selector */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)'
              }}>
                <FaChartLine className="text-white" size={18} />
              </div>
              <div>
                <h5 className="fw-bold mb-0">Store Analytics</h5>
                <small className="text-muted">Track your performance over time</small>
              </div>
            </div>

            {/* Range Selector */}
            <div className="mt-2 mt-md-0">
              <Form.Select
                value={analyticsRange}
                onChange={(e) => setAnalyticsRange(e.target.value)}
                style={{
                  width: '140px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last 1 Year</option>
              </Form.Select>
            </div>
          </div>

          {/* Charts */}
          {analytics.length > 0 ? (
            <>
              {/* Revenue Chart */}
              <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    const d = new Date(value);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Products Sold', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Revenue (KSh)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'sales') return [value, 'Products Sold'];
                    if (name === 'revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#a855f7' }}
                  activeDot={{ r: 5 }}
                  name="Products Sold"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Second Chart: Product Interest */}
            <h6 className="fw-bold mb-3 mt-4 text-muted">Product Interest (Views vs Wishlist)</h6>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#6366f1" name="Views" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wishlistAdds" fill="#ec4899" name="Wishlist Adds" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-3">No data available</p>
            )}
          </>
          ) : (
            <div className="text-center py-5 text-muted">
              <FaChartLine size={48} className="mb-3" />
              <h6 className="fw-bold">No data yet</h6>
              <p className="mb-0" style={{ fontSize: '0.875rem' }}>
                Start listing products and making sales to see your analytics here
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h4 className="fw-bold mb-3">Your Products</h4>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Sales</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.inventory}</td>
                  <td>{product.totalSales || 0}</td>
                  <td>
                    <Badge bg={product.status === 'active' ? 'success' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(product)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Inventory</Form.Label>
                  <Form.Control
                    type="number"
                    value={productData.inventory}
                    onChange={(e) => setProductData({ ...productData, inventory: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={productData.category}
                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                required
              />
            </Form.Group>

            {/* Product Image Upload */}
            <Form.Group className="mb-3">
              <Form.Label>Product Images ({productData.images.length}/5)</Form.Label>

              {/* Upload button */}
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleUploadImages}
                  disabled={uploading || productData.images.length >= 5}
                />
              </div>
              {uploading && (
                <small className="text-primary">
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Uploading...
                </small>
              )}

              {/* Image previews */}
              {productData.images.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {productData.images.map((url, index) => (
                    <div key={index} className="position-relative" style={{ width: '80px', height: '80px' }}>
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6'
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 p-0"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          fontSize: '10px',
                          lineHeight: '1',
                          transform: 'translate(25%, -25%)'
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VendorDashboard;
