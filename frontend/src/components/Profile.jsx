import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    street: user?.address?.street || '',
    building: '',
    city: user?.address?.city || '',
    county: user?.address?.state || '',
    country: user?.address?.country || 'Kenya'
  });

  const [vendorData, setVendorData] = useState({
    storeName: user?.vendorProfile?.storeName || '',
    storeDescription: user?.vendorProfile?.storeDescription || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        street: user.address?.street || '',
        building: '',
        city: user.address?.city || '',
        county: user.address?.state || '',
        country: user.address?.country || 'Kenya'
      });
      
      setVendorData({
        storeName: user.vendorProfile?.storeName || '',
        storeDescription: user.vendorProfile?.storeDescription || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/api/users/profile', {
        name: profileData.name,
        phone: profileData.phone,
        avatar: profileData.avatar,
        address: {
          street: profileData.street + (profileData.building ? `, ${profileData.building}` : ''),
          city: profileData.city,
          state: profileData.county,
          country: profileData.country
        }
      });

      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorApply = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/vendors/apply', vendorData);
      toast.success(response.data.message);
      updateUser(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply as vendor');
      toast.error('Failed to apply as vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">My Profile</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="profile" className="mb-4">
        <Tab eventKey="profile" title="Profile">
          <Card>
            <Card.Body>
              <h4 className="fw-bold mb-3">Personal Information</h4>
              <Form onSubmit={handleProfileSubmit}>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="e.g. John Kamau"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label><FaPhoneAlt className="me-1" size={12} /> Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="e.g. 0712 345 678 or +254 712 345 678"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label><FaMapMarkerAlt className="me-1" size={12} /> Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.street}
                        onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                        placeholder="e.g. Moi Avenue"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Building / House No. / Estate <span className="text-muted">(optional)</span></Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.building}
                        onChange={(e) => setProfileData({ ...profileData, building: e.target.value })}
                        placeholder="e.g. Westlands Towers, Apt 4B"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Town / City</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="e.g. Nairobi"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>County</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.county}
                        onChange={(e) => setProfileData({ ...profileData, county: e.target.value })}
                        placeholder="e.g. Nairobi County"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        readOnly
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-4 w-100 w-md-auto"
                  style={{ borderRadius: '10px', padding: '10px 32px' }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {!user?.vendorProfile && (
          <Tab eventKey="vendor" title="Become a Vendor">
            <Card>
              <Card.Body>
                <h4 className="fw-bold mb-3">Start Selling on Marketplace</h4>
                <p className="text-muted mb-4">
                  Create your store and start reaching customers today!
                </p>

                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorData.storeName}
                    onChange={(e) => setVendorData({ ...vendorData, storeName: e.target.value })}
                    placeholder="Enter your store name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Store Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={vendorData.storeDescription}
                    onChange={(e) => setVendorData({ ...vendorData, storeDescription: e.target.value })}
                    placeholder="Describe your store and products"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={handleVendorApply}
                  disabled={loading || !vendorData.storeName || !vendorData.storeDescription}
                >
                  {loading ? 'Submitting...' : 'Apply to Become a Vendor'}
                </Button>
              </Card.Body>
            </Card>
          </Tab>
        )}
      </Tabs>
    </Container>
  );
};

export default Profile;
