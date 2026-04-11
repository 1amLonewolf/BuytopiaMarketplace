import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Pagination, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = `?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await axios.get(`/api/orders/admin${params}`);
      setOrders(res.data.data);
      setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/pay`);
      toast.success('Order marked as paid');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to mark order as paid');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(price);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Manage Orders</h1>
        <Form.Select style={{ width: '200px' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Form.Select>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted">No orders found</p>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.user?.name}</td>
                      <td>{formatPrice(order.totalPrice)}</td>
                      <td>
                        <Badge bg={order.isPaid ? 'success' : 'danger'}>
                          {order.isPaid ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'pending' ? 'warning' :
                          order.status === 'processing' ? 'info' :
                          order.status === 'shipped' ? 'primary' :
                          'secondary'
                        }>{order.status}</Badge>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="info" size="sm" className="me-1" onClick={() => viewOrderDetails(order)}>
                          <FaEye />
                        </Button>
                        {!order.isPaid && (
                          <Button variant="success" size="sm" className="me-1" onClick={() => handleMarkAsPaid(order._id)}>
                            Mark Paid
                          </Button>
                        )}
                        <Form.Select
                          size="sm"
                          style={{ width: '130px', display: 'inline-block' }}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
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

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details - {selectedOrder?.orderNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Customer:</strong> {selectedOrder.user?.name}</p>
              <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
              <p><strong>Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
              <hr />
              <h6>Items:</h6>
              <Table size="sm">
                <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
                <tbody>
                  {selectedOrder.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.product?.name || item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="text-end fw-bold">Total: {formatPrice(selectedOrder.totalPrice)}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminOrders;
