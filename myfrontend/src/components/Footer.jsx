const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-5" style={{background:'#b30000'}}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h5 className="text-white mb-3">InfoBeans Foundation Library</h5>
            <p className="text-white-50 mb-3">
              Building delightful experiences for learners and communities. Browse, request, and manage books with a modern, friendly interface.
            </p>
            <div className="d-flex gap-3">
              <a href="/about" className="text-white-50">About</a>
              <a href="/contact" className="text-white-50">Contact</a>
              <a href="/books" className="text-white-50">Books</a>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white mb-3">Explore</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a className="text-white-50" href="/">Home</a></li>
              <li className="mb-2"><a className="text-white-50" href="/donate-book">Donate Book</a></li>
              <li className="mb-2"><a className="text-white-50" href="/my-requests">My Requests</a></li>
              <li className="mb-2"><a className="text-white-50" href="/dashboard">Dashboard</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-white mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><span className="text-white-50">Library Hours: Mon–Fri, 9am–6pm</span></li>
              <li className="mb-2"><span className="text-white-50">Email: library@infobeans.com</span></li>
              <li className="mb-2"><span className="text-white-50">Phone: +1 (555) 123-4567</span></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="text-white mb-3">Stay Updated</h6>
            <form className="d-flex flex-column gap-2">
              <input type="email" className="form-control" placeholder="Your email" />
              <button type="button" className="btn btn-light btn-sm">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      <div className="border-top" style={{borderColor:'rgba(255,255,255,.15) !important'}}>
        <div className="container py-3 d-flex flex-wrap justify-content-between align-items-center">
          <p className="text-white-50 mb-0">© {year} InfoBeans Foundation. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="/about" className="text-white-50">Privacy</a>
            <a href="/about" className="text-white-50">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
