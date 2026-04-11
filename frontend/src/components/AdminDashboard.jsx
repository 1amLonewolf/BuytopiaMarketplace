import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Reveal from './Reveal.jsx';
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign, FaCheck, FaStore, FaComments, FaArrowRight, FaChartLine } from 'react-icons/fa';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsRange, setAnalyticsRange] = useState('30');

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/admin/analytics?range=${analyticsRange}`);
      setAnalytics(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [analyticsRange]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await axios.put(`/api/admin/vendors/${vendorId}/approve`);
      toast.success('Vendor approved successfully!');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to approve vendor');
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
        {/* Skeleton Management Links */}
        <Row className="g-3 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Col md={4} sm={6} key={i}>
              <div className="skeleton-card">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, marginRight: '12px' }} />
                    <div className="flex-grow-1">
                      <div className="skeleton skeleton-title mb-2" style={{ width: '60%' }} />
                      <div className="skeleton" style={{ width: '40%', height: '14px' }} />
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          ))}
        </Row>
        {/* Skeleton Stats Cards */}
        <Row className="g-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Col md={3} sm={6} key={i}>
              <div className="skeleton-card">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, marginRight: '12px' }} />
                    <div>
                      <div className="skeleton" style={{ width: '80px', height: '28px', marginBottom: '6px' }} />
                      <div className="skeleton" style={{ width: '60px', height: '14px' }} />
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
          ))}
        </Row>
        {/* Skeleton Analytics */}
        <div className="skeleton-card mb-4">
          <Card.Body className="p-4">
            <div className="skeleton skeleton-title mb-3" style={{ width: '30%' }} />
            <div className="skeleton" style={{ width: '100%', height: '280px', borderRadius: '8px' }} />
          </Card.Body>
        </div>
        {/* Skeleton Table */}
        <div className="skeleton-card">
          <Card.Body className="p-4">
            <div className="skeleton skeleton-title mb-3" style={{ width: '25%' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px', borderRadius: '6px' }} />
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
      <h1 className="fw-bold mb-4">Admin Dashboard</h1>

      {/* Management Links */}
      <Reveal>
      <Row className="mb-4 section-fade-bottom">
        <Col md={4} sm={6} className="mb-3">
          <Link to="/admin/users" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <FaUsers size={30} className="text-primary me-3" />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-0 text-dark">Manage Users</h5>
                  <small className="text-muted">{stats?.totalUsers} users</small>
                </div>
                <FaArrowRight className="text-muted" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Link to="/admin/products" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <FaBox size={30} className="text-success me-3" />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-0 text-dark">Manage Products</h5>
                  <small className="text-muted">{stats?.totalProducts} products</small>
                </div>
                <FaArrowRight className="text-muted" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Link to="/admin/orders" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <FaShoppingCart size={30} className="text-warning me-3" />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-0 text-dark">Manage Orders</h5>
                  <small className="text-muted">{stats?.totalOrders} orders</small>
                </div>
                <FaArrowRight className="text-muted" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Link to="/admin/vendors" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <FaStore size={30} className="text-info me-3" />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-0 text-dark">Manage Vendors</h5>
                  <small className="text-muted">{stats?.pendingVendors?.length || 0} pending</small>
                </div>
                <FaArrowRight className="text-muted" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} sm={6} className="mb-3">
          <Link to="/admin/reviews" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center">
                <FaComments size={30} className="text-danger me-3" />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-0 text-dark">Manage Reviews</h5>
                  <small className="text-muted">Moderate reviews</small>
                </div>
                <FaArrowRight className="text-muted" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      </Reveal>

      {/* Stats Cards */}
      <Reveal>
      <Row className="mb-4 section-fade-bottom">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUsers size={30} className="text-primary me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.totalUsers}</h3>
                  <small className="text-muted">Total Users</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaBox size={30} className="text-success me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.totalProducts}</h3>
                  <small className="text-muted">Products</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaShoppingCart size={30} className="text-warning me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{stats?.totalOrders}</h3>
                  <small className="text-muted">Orders</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaDollarSign size={30} className="text-info me-3" />
                <div>
                  <h3 className="fw-bold mb-0">{formatPrice(stats?.totalRevenue)}</h3>
                  <small className="text-muted">Revenue</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Reveal>

      {/* Admin Analytics Section */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)'
              }}>
                <FaChartLine className="text-white" size={18} />
              </div>
              <div>
                <h5 className="fw-bold mb-0">Platform Analytics</h5>
                <small className="text-muted">Overall site performance</small>
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

          {analytics.length > 0 ? (
            <>
              {/* Revenue & Orders */}
              <h6 className="fw-bold mb-3 text-muted">Revenue & Orders</h6>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics}>
                  <defs>
                    <linearGradient id="adminColorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminColorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                      if (name === 'orders') return [value, 'Orders'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#f59e0b" fillOpacity={1} fill="url(#adminColorOrders)" name="Orders" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#adminColorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>

              {/* Growth Metrics */}
              <h6 className="fw-bold mb-3 mt-4 text-muted">Platform Growth</h6>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => {
                    const d = new Date(value); return `${d.getDate()}/${d.getMonth() + 1}`;
                  }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })} />
                  <Legend />
                  <Line type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} dot={false} name="New Users" />
                  <Line type="monotone" dataKey="newVendors" stroke="#8b5cf6" strokeWidth={2} dot={false} name="New Vendors" />
                  <Line type="monotone" dataKey="newProducts" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Products" />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="text-center py-5 text-muted">
              <FaChartLine size={48} className="mb-3" />
              <h6 className="fw-bold">No analytics data available</h6>
              <p className="mb-0" style={{ fontSize: '0.875rem' }}>Analytics will appear as users register and orders come in.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pending Vendors */}
      {stats?.pendingVendors?.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h4 className="fw-bold mb-3">Pending Vendor Applications</h4>
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Store Name</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingVendors.map(vendor => (
                  <tr key={vendor._id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.vendorProfile?.storeName}</td>
                    <td>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleApproveVendor(vendor._id)}
                      >
                        <FaCheck className="me-1" />
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h4 className="fw-bold mb-3">Recent Orders</h4>
          <Table responsive>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.slice(0, 10).map(order => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.user?.name}</td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <Badge bg={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'pending' ? 'warning' :
                      order.status === 'processing' ? 'info' :
                      order.status === 'shipped' ? 'primary' :
                      'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
