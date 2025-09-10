"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const AddBook = () => {
  const [formData, setFormData] = useState({
    bookTitle: "",
    isbn: "",
    publisher: "",
    year: "",
    bookAuthor: "",
    totalCopies: "",
    description: "",
    categoryName: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Comprehensive category options with icons and descriptions
  const categoryOptions = [
    // Academic Categories
    { value: "Computer Science", label: "💻 Computer Science", description: "Algorithms, computing theory" },
    { value: "Mathematics", label: "🔢 Mathematics", description: "Mathematical concepts and theories" },
    { value: "Physics", label: "⚛️ Physics", description: "Physical sciences and natural laws" },
    { value: "Chemistry", label: "🧪 Chemistry", description: "Chemical sciences and molecular studies" },
    { value: "Biology", label: "🧬 Biology", description: "Life sciences and living organisms" },
    { value: "Engineering", label: "⚙️ Engineering", description: "Engineering principles and applications" },
    { value: "Medicine", label: "🏥 Medicine", description: "Medical sciences and healthcare" },
    { value: "Psychology", label: "🧠 Psychology", description: "Human mind and behavior studies" },
    { value: "Economics", label: "💰 Economics", description: "Economic theories and financial systems" },
    { value: "Business", label: "💼 Business", description: "Business management and entrepreneurship" },
    { value: "Law", label: "⚖️ Law", description: "Legal studies and jurisprudence" },
    { value: "Education", label: "🎓 Education", description: "Teaching methods and educational theories" },
    
    // Literature Categories
    { value: "Fiction", label: "📖 Fiction", description: "Imaginative stories and creative literature" },
    { value: "Non-Fiction", label: "📚 Non-Fiction", description: "Factual books based on real events" },
    { value: "Science Fiction", label: "🚀 Science Fiction", description: "Futuristic and scientific fiction" },
    { value: "Fantasy", label: "🐉 Fantasy", description: "Magical and supernatural fiction" },
    { value: "Mystery & Thriller", label: "🔍 Mystery & Thriller", description: "Suspense and detective stories" },
    { value: "Romance", label: "💕 Romance", description: "Love stories and romantic fiction" },
    { value: "Historical Fiction", label: "🏛️ Historical Fiction", description: "Fiction set in historical periods" },
    { value: "Biography & Memoir", label: "👤 Biography & Memoir", description: "Life stories and personal accounts" },
    { value: "Poetry", label: "📝 Poetry", description: "Poetic works and verse" },
    { value: "Drama", label: "🎭 Drama", description: "Dramatic literature and plays" },
    
    // Programming & Technology
    { value: "Programming", label: "⚡ Programming", description: "Programming languages and coding" },
    { value: "Web Development", label: "🌐 Web Development", description: "Frontend and backend development" },
    { value: "Mobile Development", label: "📱 Mobile Development", description: "Mobile app development" },
    { value: "Data Science", label: "📊 Data Science", description: "Data analysis and statistics" },
    { value: "Artificial Intelligence", label: "🤖 Artificial Intelligence", description: "AI and machine learning" },
    { value: "Machine Learning", label: "🧠 Machine Learning", description: "ML algorithms and applications" },
    { value: "Cybersecurity", label: "🔒 Cybersecurity", description: "Security and protection" },
    { value: "Database", label: "🗄️ Database", description: "Database systems and management" },
    { value: "DevOps", label: "🔄 DevOps", description: "Development and operations" },
    { value: "Cloud Computing", label: "☁️ Cloud Computing", description: "Cloud platforms and services" },
    
    // General Categories
    { value: "History", label: "🏛️ History", description: "Historical events and periods" },
    { value: "Philosophy", label: "🤔 Philosophy", description: "Philosophical thoughts and theories" },
    { value: "Religion", label: "⛪ Religion", description: "Religious texts and spiritual studies" },
    { value: "Politics", label: "🗳️ Politics", description: "Political science and governance" },
    { value: "Sociology", label: "👥 Sociology", description: "Social behavior and society studies" },
    { value: "Geography", label: "🌍 Geography", description: "Earth sciences and spatial studies" },
    { value: "Art & Design", label: "🎨 Art & Design", description: "Creative arts and design principles" },
    { value: "Music", label: "🎵 Music", description: "Musical theory and performance" },
    { value: "Sports", label: "⚽ Sports", description: "Athletics and physical activities" },
    { value: "Travel", label: "✈️ Travel", description: "Travel guides and exploration" },
    { value: "Cooking", label: "👨‍🍳 Cooking", description: "Culinary arts and recipes" },
    { value: "Self-Help", label: "💪 Self-Help", description: "Personal development and improvement" },
    { value: "Children", label: "👶 Children", description: "Books for young readers" },
    { value: "Young Adult", label: "👨‍🎓 Young Adult", description: "Books for teenage readers" },
    { value: "Reference", label: "📖 Reference", description: "Reference materials and encyclopedias" },
    { value: "Magazines", label: "📰 Magazines", description: "Periodicals and magazines" },
    { value: "Other", label: "📚 Other", description: "Miscellaneous and general topics" }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category/getCategories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('bookTitle', formData.bookTitle);
      formDataToSend.append('isbn', formData.isbn);
      formDataToSend.append('publisher', formData.publisher);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('bookAuthor', formData.bookAuthor);
      formDataToSend.append('totalCopies', formData.totalCopies);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryName', formData.categoryName);
      
      if (selectedFile) {
        formDataToSend.append('coverImage', selectedFile);
      }

      const response = await api.post("/books/postBook", formDataToSend, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
      });

      setSuccess(response.data.message || "Book added successfully!");

      // Reset form
      setFormData({
        bookTitle: "",
        isbn: "",
        publisher: "",
        year: "",
        bookAuthor: "",
        totalCopies: "",
        description: "",
        categoryName: ""
      });
      setSelectedFile(null);

      // Redirect after success
      setTimeout(() => {
        navigate("/books");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-primary">Add New Book</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    {/* Book Title */}
                    <div className="mb-3">
                      <label className="form-label">Book Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bookTitle"
                        value={formData.bookTitle}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* ISBN */}
                    <div className="mb-3">
                      <label className="form-label">ISBN *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Publisher */}
                    <div className="mb-3">
                      <label className="form-label">Publisher *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Year */}
                    <div className="mb-3">
                      <label className="form-label">Publication Year *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    {/* Author */}
                    <div className="mb-3">
                      <label className="form-label">Author *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bookAuthor"
                        value={formData.bookAuthor}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Total Copies */}
                    <div className="mb-3">
                      <label className="form-label">Total Copies *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="totalCopies"
                        value={formData.totalCopies}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>

                    {/* Enhanced Category Selection */}
                    <div className="mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category...</option>
                        <optgroup label="📚 Academic & Professional">
                          {categoryOptions.slice(0, 12).map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📖 Literature & Fiction">
                          {categoryOptions.slice(12, 21).map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="💻 Programming & Technology">
                          {categoryOptions.slice(21, 31).map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🌍 General & Other">
                          {categoryOptions.slice(31).map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      {formData.categoryName && (
                        <small className="form-text text-muted">
                          {categoryOptions.find(cat => cat.value === formData.categoryName)?.description}
                        </small>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="mb-3">
                      <label className="form-label">Cover Image</label>
                      <input 
                        type="file" 
                        name="coverImage"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="form-control"
                      />
                      <small className="form-text text-muted">
                        Upload a cover image (JPG, PNG, GIF). Max size: 5MB
                      </small>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of the book..."
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding Book...
                      </>
                    ) : (
                      "Add Book"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/books")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
