import React, { useState, useEffect } from 'react'
import axios from 'axios'

const About = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalDonations: 0,
    totalRequests: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [booksRes, usersRes, donationsRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/books`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/book-donations`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/book-requests`).catch(() => ({ data: [] }))
      ])

      setStats({
        totalBooks: booksRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalDonations: donationsRes.data?.length || 0,
        totalRequests: requestsRes.data?.length || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 bg-light border-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-dark">
                About InfoBeans Foundation
              </h1>
              <p className="lead mb-4 text-muted">
                InfoBeans Foundation is the social impact arm of InfoBeans Technologies, 
                dedicated to empowering communities through technology and education.
              </p>
              <p className="mb-4 text-secondary">
                Founded in 2000, we have been serving the community for over 24 years, 
                focusing on providing free access to educational resources and fostering 
                learning opportunities for everyone.
              </p>
              
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="bg-white border rounded-3 p-3 text-center shadow-sm">
                    <div className="fw-bold fs-4 text-primary">24+</div>
                    <small className="text-muted">Years of Service</small>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="bg-white border rounded-3 p-3 text-center shadow-sm">
                    <div className="fw-bold fs-4 text-primary">
                      {stats.loading ? '...' : stats.totalUsers.toLocaleString()}+
                    </div>
                    <small className="text-muted">Lives Impacted</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <div className="bg-white border rounded-4 p-5 shadow-sm">
                  <i className="bi bi-book-half display-1 text-primary mb-3"></i>
                  <h4 className="text-dark mb-3">Our Digital Library</h4>
                  <p className="text-muted mb-4">
                    A comprehensive platform democratizing access to knowledge 
                    and fostering learning in our community.
                  </p>
                  <div className="text-start">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span className="text-muted">
                        {stats.loading ? 'Loading...' : `${stats.totalBooks.toLocaleString()}+ Books Available`}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span className="text-muted">24/7 Digital Access</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span className="text-muted">Community Driven</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-dark">Our Foundation</h2>
            <p className="lead text-muted">Built on strong values and clear purpose</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-light border rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '70px', height: '70px'}}>
                    <i className="bi bi-eye fs-3 text-secondary"></i>
                  </div>
                  <h5 className="fw-bold mb-3 text-dark">Our Vision</h5>
                  <p className="text-muted small">
                    To create meaningful impact through technology and education, 
                    empowering communities to achieve their full potential and build a better tomorrow.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-light border rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '70px', height: '70px'}}>
                    <i className="bi bi-target fs-3 text-secondary"></i>
                  </div>
                  <h5 className="fw-bold mb-3 text-dark">Our Mission</h5>
                  <p className="text-muted small">
                    To do meaningful work that creates lasting value for our community 
                    through innovative digital solutions, quality education, and sustainable social impact.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="bg-light border rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '70px', height: '70px'}}>
                    <i className="bi bi-gem fs-3 text-secondary"></i>
                  </div>
                  <h5 className="fw-bold mb-3 text-dark">Our Values</h5>
                  <p className="text-muted small">
                    Excellence, Compassion, Openness, and Ownership. 
                    We believe in creating WOW experiences while maintaining integrity and fostering innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">What We Do</h2>
            <p className="lead text-muted">Transforming communities through education and technology</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <div className="bg-white border rounded-3 p-3 me-3">
                      <i className="bi bi-laptop fs-4 text-secondary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2 text-dark">IT Training Programs</h6>
                      <p className="text-muted small mb-3">
                        Free comprehensive training programs for financially underprivileged students 
                        in partnership with IIT Indore, covering modern technologies and industry-relevant skills.
                      </p>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <small className="text-muted">Partnership with IIT Indore</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="card border shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <div className="bg-white border rounded-3 p-3 me-3">
                      <i className="bi bi-book fs-4 text-secondary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2 text-dark">Digital Library</h6>
                      <p className="text-muted small mb-3">
                        A comprehensive library management system providing 24/7 access to educational resources, 
                        books, and learning materials for our community members.
                      </p>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <small className="text-muted">
                          {stats.loading ? 'Loading...' : `${stats.totalBooks.toLocaleString()}+ Books Available`}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="card border shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <div className="bg-white border rounded-3 p-3 me-3">
                      <i className="bi bi-people fs-4 text-secondary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2 text-dark">Community Empowerment</h6>
                      <p className="text-muted small mb-3">
                        Empowering communities through skill development, technology access, 
                        and educational opportunities that create lasting social impact.
                      </p>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <small className="text-muted">
                          {stats.loading ? 'Loading...' : `${stats.totalUsers.toLocaleString()}+ Lives Impacted`}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="card border shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <div className="bg-white border rounded-3 p-3 me-3">
                      <i className="bi bi-lightbulb fs-4 text-secondary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-2 text-dark">Innovation & Research</h6>
                      <p className="text-muted small mb-3">
                        Supporting innovative projects and research initiatives that leverage technology 
                        to solve real-world problems and create positive change.
                      </p>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        <small className="text-muted">Research Partnerships</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Impact Section */}
      <section className="py-5 border-top">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3 text-dark">Our Impact</h2>
            <p className="lead text-muted">Making a difference in communities across India</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-light rounded-3 border">
                <div className="display-5 fw-bold text-primary mb-2">
                  {stats.loading ? '...' : stats.totalUsers.toLocaleString()}+
                </div>
                <div className="h6 text-muted">Users Served</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-light rounded-3 border">
                <div className="display-5 fw-bold text-primary mb-2">
                  {stats.loading ? '...' : stats.totalDonations.toLocaleString()}+
                </div>
                <div className="h6 text-muted">Book Donations</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-light rounded-3 border">
                <div className="display-5 fw-bold text-primary mb-2">
                  {stats.loading ? '...' : stats.totalBooks.toLocaleString()}+
                </div>
                <div className="h6 text-muted">Books Available</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center p-4 bg-light rounded-3 border">
                <div className="display-5 fw-bold text-primary mb-2">24+</div>
                <div className="h6 text-muted">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About


