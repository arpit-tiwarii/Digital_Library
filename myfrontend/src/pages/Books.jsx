"use client"

import { useState, useEffect } from "react"
import BookCard from "../components/BookCard.jsx"
import api from "../api/api.js"
import adminAccess from "../api/adminAuth.js"

const Books = () => {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("title")
  const [editMode, setEditMode] = useState(false)

  // Fallback sample data
  const sampleBooks = [
    {
      id: 1,
      bookTitle: "Clean Code",
      bookAuthor: "Robert C. Martin",
      categoryName: "Programming",
      availableCopies: 4,
      description: "A handbook of agile software craftsmanship",
      coverImage: "/placeholder.svg?height=200&width=150",
    },
    {
      id: 2,
      bookTitle: "You Don't Know JS",
      bookAuthor: "Kyle Simpson",
      categoryName: "Programming",
      availableCopies: 2,
      description: "A book series on JavaScript",
      coverImage: "/placeholder.svg?height=200&width=150",
    },
    {
      id: 3,
      bookTitle: "The Pragmatic Programmer",
      bookAuthor: "David Thomas",
      categoryName: "Programming",
      availableCopies: 3,
      description: "Your journey to mastery",
      coverImage: "/placeholder.svg?height=200&width=150",
    },
  ]

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books/getBooks")
      setBooks(response.data.books)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("Failed to load books from server. Showing sample data.")
      setBooks(sampleBooks)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category/getCategories")
      console.log("Categories response:", response.data)
      // The new API returns { success: true, data: [...] }
      if (response.data && response.data.success && response.data.data) {
        setCategories(response.data.data)
      } else if (Array.isArray(response.data)) {
        // Fallback for old structure
        setCategories(response.data)
      } else {
        console.error("Unexpected categories response structure:", response.data)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const handleBookIssue = (bookId) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        (book._id === bookId || book.id === bookId || book.bookId === bookId)
          ? { ...book, availableCopies: (book.availableCopies || 0) - 1 }
          : book,
      ),
    )
  }

  const filteredBooks = books.filter(
    (book) => {
      const matchesSearch = (book.bookTitle || book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (book.bookAuthor || book.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (book.categoryName || book.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || (book.categoryName || book.category) === selectedCategory
      
      return matchesSearch && matchesCategory
    }
  )

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a.bookTitle || a.title || '').localeCompare(b.bookTitle || b.title || '')
      case "author":
        return (a.bookAuthor || a.author || '').localeCompare(b.bookAuthor || b.author || '')
      case "category":
        return (a.categoryName || a.category || '').localeCompare(b.categoryName || b.category || '')
      case "available":
        return (b.availableCopies || 0) - (a.availableCopies || 0)
      default:
        return 0
    }
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSortBy("title")
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading books...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-4">Library Books</h1>

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
              </div>
            </div>
            
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.icon} {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="category">Sort by Category</option>
                <option value="available">Sort by Availability</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted mb-0">
              Found {sortedBooks.length} book{sortedBooks.length !== 1 ? "s" : ""}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
            
            {(searchTerm || selectedCategory) && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Category Pills */}
          {Array.isArray(categories) && categories.length > 0 && (
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </button>
                {categories.slice(0, 8).map((category) => (
                  <button
                    key={category._id}
                    className={`btn btn-sm ${selectedCategory === category.categoryName ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedCategory(category.categoryName)}
                    style={{
                      borderColor: category.color,
                      color: selectedCategory === category.categoryName ? 'white' : category.color,
                      backgroundColor: selectedCategory === category.categoryName ? category.color : 'transparent'
                    }}
                  >
                    {category.icon} {category.categoryName}
                  </button>
                ))}
                {categories.length > 8 && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedCategory("")}
                  >
                    +{categories.length - 8} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="row">
        {sortedBooks.length > 0 ? (
          sortedBooks.map((book) => (
            <BookCard
              key={book._id || book.id || book.bookId}
              book={book}
              onIssue={handleBookIssue}
              showIssueButton={localStorage.getItem("token")}
              showEditButton={adminAccess()}
            />
          ))
        ) : (
          <div className="col-12 text-center">
            <div className="alert alert-info">
              <h4>No books found</h4>
              <p>
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search terms or filters." 
                  : "Check back later for new additions to the library."
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  className="btn btn-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Books
