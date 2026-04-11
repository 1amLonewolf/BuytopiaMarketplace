import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Pagination, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar, FaTrash, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = `?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await axios.get(`/api/admin/products${params}`);
      setProducts(res.data.data);
      setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      const res = await axios.put(`/api/admin/products/${productId}/featured`);
      toast.success(res.data.data.isFeatured ? 'Product marked as featured' : 'Product removed from featured');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(price);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="fw-bold">Manage Products</h1>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '250px' }}
          />
          <Form.Select style={{ width: '150px' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Form.Select>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td>
                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                      </td>
                      <td>{product.category}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <Badge bg={product.inventory > 10 ? 'success' : product.inventory > 0 ? 'warning' : 'danger'}>
                          {product.inventory}
                        </Badge>
                      </td>
                      <td>
                        <FaStar className="text-warning" /> {product.rating?.toFixed(1) || '0.0'}
                      </td>
                      <td>{product.vendor?.name || 'N/A'}</td>
                      <td>
                        <Badge bg={product.status === 'active' ? 'success' : 'secondary'}>{product.status}</Badge>
                      </td>
                      <td>
                        {product.isFeatured ? <Badge bg="info">Featured</Badge> : <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <Button
                          variant={product.isFeatured ? 'outline-warning' : 'outline-info'}
                          size="sm"
                          className="me-1"
                          onClick={() => handleToggleFeatured(product._id)}
                        >
                          {product.isFeatured ? <FaToggleOn /> : <FaToggleOff />}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-center">
                <Pagination>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminProducts;
