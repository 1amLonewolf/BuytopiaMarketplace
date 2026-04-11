import React, { useState, useEffect, Fragment } from 'react';
import { Container, Row, Col, Form, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: 'createdAt:desc'
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      params.append('page', pagination.page);
      params.append('limit', 12);

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'createdAt:desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.minRating;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
        <h1 className="fw-bold mb-0">
          <span className="text-primary">All</span> Products
        </h1>
        <Button 
          variant="outline-primary" 
          className="d-md-none"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="me-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Enhanced Filter Bar */}
      <div className={`filter-bar mb-4 ${showFilters ? 'd-block' : 'd-none d-md-block'}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">
            <FaFilter className="me-2 text-primary" />
            Filters
          </h6>
          {hasActiveFilters && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none p-0"
              onClick={clearFilters}
            >
              <FaTimes className="me-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <Form onSubmit={handleSearch}>
          <Row className="g-3">
            {/* Search Input */}
            <Col md={4}>
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-input search-input"
                />
              </div>
            </Col>

            {/* Category Select */}
            <Col md={2}>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Sort Select */}
            <Col md={2}>
              <Form.Select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Highest Rated</option>
                <option value="name:asc">Name: A-Z</option>
              </Form.Select>
            </Col>

            {/* Price Range */}
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="filter-input"
              />
            </Col>

            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="filter-input"
              />
            </Col>
          </Row>
        </Form>
      </div>

      {/* Results Count */}
      {!loading && (
        <p className="text-muted mb-3 fade-in">
          <strong>{pagination.total}</strong> product{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <Row>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col key={index} md={3} sm={6} className="mb-4">
              <div className="skeleton-card">
                <div className="skeleton-image" />
                <div className="p-3">
                  <div className="skeleton-text skeleton-title" />
                  <div className="skeleton-text" />
                  <div className="skeleton-text skeleton-price" />
                  <div className="skeleton-text skeleton-button" />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : products.length === 0 ? (
        <div className="text-center py-5 fade-in">
          <FaSearch size={60} className="text-muted mb-3" />
          <h3 className="fw-bold mb-3">No Products Found</h3>
          <p className="text-muted mb-4">Try adjusting your filters or search terms</p>
          <Button variant="primary" onClick={clearFilters}>
            <FaTimes className="me-2" />
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <Row>
            {products.map((product, index) => (
              <Col 
                key={product._id} 
                md={3} 
                sm={6} 
                className="mb-4 fade-in-up" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Enhanced Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4 fade-in">
              <Pagination>
                {pagination.page > 1 && (
                  <Pagination.First onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} />
                )}
                {pagination.page > 1 && (
                  <Pagination.Prev onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} />
                )}
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => {
                    if (pagination.pages <= 7) return true;
                    if (page === 1 || page === pagination.pages) return true;
                    if (Math.abs(page - pagination.page) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <Pagination.Ellipsis disabled />}
                        <Pagination.Item
                          active={page === pagination.page}
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </Pagination.Item>
                      </React.Fragment>
                    );
                  })}
                
                {pagination.page < pagination.pages && (
                  <Pagination.Next onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} />
                )}
                {pagination.page < pagination.pages && (
                  <Pagination.Last onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))} />
                )}
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;
