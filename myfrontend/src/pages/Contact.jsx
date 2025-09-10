import React, { useState } from 'react'
import api from '../api/api.js'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', msg: '' })
    setLoading(true)
    try {
      const res = await api.post('/contact', form)
      if (res.data?.success) {
        setStatus({ type: 'success', msg: 'Thank you! We received your message and will respond within 1-2 business days.' })
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus({ type: 'danger', msg: 'Failed to submit. Please try again.' })
      }
    } catch (err) {
      setStatus({ type: 'danger', msg: err.response?.data?.message || 'Failed to submit. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-5">
      {/* Hero Section */}
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{color:'#b30000'}}>Get In Touch</h1>
          <p className="lead text-muted">Connect with InfoBeans Foundation - We're here to help and answer your questions</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-light py-5 mb-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 hover-lift">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-geo-alt fs-2 text-primary"></i>
                  </div>
                  <h5 className="card-title mb-3" style={{color:'#b30000'}}>Visit Our Office</h5>
                  <p className="card-text text-muted">
                    InfoBeans Technologies Ltd.<br/>
                    Indore, Madhya Pradesh<br/>
                    India
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 hover-lift">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-telephone fs-2 text-primary"></i>
                  </div>
                  <h5 className="card-title mb-3" style={{color:'#b30000'}}>Call Us</h5>
                  <p className="card-text text-muted">
                    Foundation Programs:<br/>
                    +91 8889551164<br/>
                    +91 9699749172
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100 hover-lift">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="bi bi-envelope fs-2 text-primary"></i>
                  </div>
                  <h5 className="card-title mb-3" style={{color:'#b30000'}}>Email Us</h5>
                  <p className="card-text text-muted">
                    Foundation Inquiries:<br/>
                    foundation@infobeans.com<br/>
                    library@infobeans.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-gradient text-white text-center py-4" style={{background: 'linear-gradient(135deg, #b30000 0%, #8b0000 100%)'}}>
                <h3 className="mb-0">Send Us a Message</h3>
                <p className="mb-0 opacity-75">We typically respond within 1-2 business days</p>
              </div>
              <div className="card-body p-5">
                {status.msg && (
                  <div className={`alert alert-${status.type} d-flex align-items-center`} role="alert">
                    <i className={`bi ${status.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                    {status.msg}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Full Name *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-person text-muted"></i>
                        </span>
                        <input 
                          required 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="form-control border-start-0" 
                          placeholder="Enter your full name" 
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Email Address *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input 
                          required 
                          type="email" 
                          name="email" 
                          value={form.email} 
                          onChange={handleChange} 
                          className="form-control border-start-0" 
                          placeholder="your.email@example.com" 
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Subject</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-chat-dots text-muted"></i>
                        </span>
                        <select 
                          name="subject" 
                          value={form.subject} 
                          onChange={handleChange} 
                          className="form-select border-start-0"
                        >
                          <option value="">Select a topic</option>
                          <option value="Library Access">Library Access & Registration</option>
                          <option value="IT Training Programs">IT Training Programs</option>
                          <option value="Book Donation">Book Donation</option>
                          <option value="Partnership">Partnership Opportunities</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Message *</label>
                      <textarea 
                        required 
                        name="message" 
                        value={form.message} 
                        onChange={handleChange} 
                        className="form-control" 
                        rows="6" 
                        placeholder="Please provide details about your inquiry, question, or how we can help you..."
                      ></textarea>
                      <div className="form-text">Minimum 10 characters required</div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="bi bi-shield-check me-1"></i>
                          Your information is secure and will not be shared
                        </small>
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg px-5" 
                          disabled={loading || form.message.length < 10}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="container mt-5">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title mb-3" style={{color:'#b30000'}}>
                  <i className="bi bi-clock me-2"></i>Response Times
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>General inquiries: 1-2 business days</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Technical support: 24-48 hours</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Partnership requests: 3-5 business days</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Urgent matters: Same day (if received before 3 PM IST)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h5 className="card-title mb-3" style={{color:'#b30000'}}>
                  <i className="bi bi-question-circle me-2"></i>Frequently Asked
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><i className="bi bi-arrow-right text-primary me-2"></i>How to register for IT training programs?</li>
                  <li className="mb-2"><i className="bi bi-arrow-right text-primary me-2"></i>Library membership and access requirements</li>
                  <li className="mb-2"><i className="bi bi-arrow-right text-primary me-2"></i>Book donation process and guidelines</li>
                  <li><i className="bi bi-arrow-right text-primary me-2"></i>Partnership and collaboration opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact


