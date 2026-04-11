import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaStore } from 'react-icons/fa';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get('/api/admin/vendors/pending'),
        axios.get('/api/vendors?limit=100')
      ]);
      const allVendors = [
        ...pendingRes.data.data.map(v => ({ ...v, status: 'pending' })),
        ...(approvedRes.data.data || []).map(v => ({ ...v, status: 'approved' }))
      ];
      setVendors(allVendors);
    } catch (error) {
      // If approved vendors endpoint doesn't exist, just show pending
      try {
        const pendingRes = await axios.get('/api/admin/vendors/pending');
        setVendors(pendingRes.data.data.map(v => ({ ...v, status: 'pending' })));
      } catch {
        toast.error('Failed to fetch vendors');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      await axios.put(`/api/admin/vendors/${vendorId}/approve`);
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    try {
      await axios.delete(`/api/admin/users/${vendorId}`);
      toast.success('Vendor application rejected');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to reject vendor');
    }
  };

  const viewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailModal(true);
  };

  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">Manage Vendors</h1>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : vendors.length === 0 ? (
            <p className="text-center text-muted">No vendor applications found</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Store Name</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(vendor => (
                  <tr key={vendor._id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.vendorProfile?.storeName || 'N/A'}</td>
                    <td>
                      <Badge bg={vendor.status === 'approved' ? 'success' : 'warning'}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button variant="info" size="sm" className="me-1" onClick={() => viewVendorDetails(vendor)}>
                        View
                      </Button>
                      {vendor.status === 'pending' && (
                        <>
                          <Button variant="success" size="sm" className="me-1" onClick={() => handleApproveVendor(vendor._id)}>
                            <FaCheck /> Approve
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleRejectVendor(vendor._id)}>
                            <FaTimes /> Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title><FaStore className="me-2" />Vendor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendor && (
            <>
              <p><strong>Name:</strong> {selectedVendor.name}</p>
              <p><strong>Email:</strong> {selectedVendor.email}</p>
              <p><strong>Store Name:</strong> {selectedVendor.vendorProfile?.storeName || 'Not provided'}</p>
              <p><strong>Description:</strong> {selectedVendor.vendorProfile?.storeDescription || 'Not provided'}</p>
              <p><strong>Rating:</strong> {selectedVendor.vendorProfile?.rating || 0}</p>
              <p><strong>Total Sales:</strong> {selectedVendor.vendorProfile?.totalSales || 0}</p>
              <p><strong>Status:</strong> <Badge bg={selectedVendor.status === 'approved' ? 'success' : 'warning'}>{selectedVendor.status}</Badge></p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminVendors;
