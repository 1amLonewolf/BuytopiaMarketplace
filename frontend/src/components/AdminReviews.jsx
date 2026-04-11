import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Pagination, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar, FaTrash, FaCheck } from 'react-icons/fa';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = `?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res = await axios.get(`/api/admin/reviews${params}`);
      setReviews(res.data.data);
      setTotalPages(Math.ceil(res.data.pagination.total / res.data.pagination.limit));
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/${reviewId}/approve`);
      toast.success('Review approved');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={i < rating ? 'text-warning' : 'text-muted'} />
    ));
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Manage Reviews</h1>
        <Form.Select style={{ width: '200px' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </Form.Select>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted">No reviews found</p>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Product</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review._id}>
                      <td>{review.user?.name}</td>
                      <td>{review.product?.name}</td>
                      <td>{renderStars(review.rating)}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.comment}
                      </td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="success" size="sm" className="me-1" onClick={() => handleApproveReview(review._id)}>
                          <FaCheck />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review._id)}>
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

export default AdminReviews;
