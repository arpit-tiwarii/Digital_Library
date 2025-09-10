import { useState, useEffect } from "react";
import api from "../api/api.js";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    description: "",
    color: "#007bff",
    icon: "📚"
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/category/getCategories");
      setCategories(response.data?.data || []);
      setError("");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/category/postCategory", newCategory);
      setSuccess("Category added successfully!");
      setNewCategory({ categoryName: "", description: "", color: "#007bff", icon: "📚" });
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/category/updateCategory/${editingCategory._id}`, editingCategory);
      setSuccess("Category updated successfully!");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/category/deleteCategory/${categoryId}`);
      setSuccess("Category deleted");
      fetchCategories();
    } catch (error) {
      setError("Failed to delete category");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Manage Categories</h3>
        <button className="btn btn-outline-secondary" onClick={fetchCategories}>Refresh</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        <div className="col-md-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Add Category</h5>
              <form onSubmit={handleAddCategory} className="d-grid gap-2">
                <input className="form-control" placeholder="Category name" value={newCategory.categoryName} onChange={(e)=>setNewCategory({...newCategory, categoryName:e.target.value})} required />
                <input className="form-control" placeholder="Description" value={newCategory.description} onChange={(e)=>setNewCategory({...newCategory, description:e.target.value})} />
                <div className="d-flex gap-2">
                  <input type="color" className="form-control form-control-color" value={newCategory.color} onChange={(e)=>setNewCategory({...newCategory, color:e.target.value})} />
                  <input className="form-control" placeholder="Icon (emoji)" value={newCategory.icon} onChange={(e)=>setNewCategory({...newCategory, icon:e.target.value})} />
                </div>
                <button className="btn btn-danger">Add</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Existing Categories</h5>
              {loading ? (
                <div className="text-center"><span className="spinner-border" /></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Color</th>
                        <th>Icon</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat._id}>
                          <td>{cat.categoryName}</td>
                          <td className="text-muted">{cat.description}</td>
                          <td><span className="badge" style={{background: cat.color}}>&nbsp;&nbsp;&nbsp;</span></td>
                          <td>{cat.icon}</td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button className="btn btn-sm btn-outline-primary" onClick={()=>setEditingCategory(cat)}>Edit</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={()=>handleDeleteCategory(cat._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {editingCategory && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Edit Category</h5>
                <form onSubmit={handleUpdateCategory} className="row g-2">
                  <div className="col-md-4">
                    <input className="form-control" value={editingCategory.categoryName} onChange={(e)=>setEditingCategory({...editingCategory, categoryName:e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <input className="form-control" value={editingCategory.description} onChange={(e)=>setEditingCategory({...editingCategory, description:e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <input type="color" className="form-control form-control-color" value={editingCategory.color} onChange={(e)=>setEditingCategory({...editingCategory, color:e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <input className="form-control" value={editingCategory.icon} onChange={(e)=>setEditingCategory({...editingCategory, icon:e.target.value})} />
                  </div>
                  <div className="col-12 d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={()=>setEditingCategory(null)}>Cancel</button>
                    <button className="btn btn-danger">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
