import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import AdminLayout from "./AdminLayout";
import ProductImage from "@/components/common/ProductImage";
import { uploadImageApi } from "@/services/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiImage,
} from "react-icons/fi";

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      id: "",
      name: "",
      slug: "",
      description: "",
      image: "/src/assets/images/categories (1).webp",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id || "",
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImageApi(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const generatedSlug =
        formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const payload = {
        ...formData,
        slug: generatedSlug,
        id: formData.id || generatedSlug,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await addCategory(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving category: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${category.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCategory(category.id);
      } catch (err) {
        alert("Failed to delete category: " + err.message);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Category Management</h2>
            <p className="text-xs text-slate-500">
              Add, edit, or delete main product categories visible on the dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>

        {/* Categories Table / List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Slug / ID</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="w-12 h-10 rounded overflow-hidden border border-slate-200 bg-slate-100">
                          <ProductImage
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{cat.name}</td>
                      <td className="p-3 font-mono text-[11px] text-orange-600">{cat.slug}</td>
                      <td className="p-3 max-w-md line-clamp-2 text-slate-500">
                        {cat.description || "No description set"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded transition-colors"
                            title="Edit Category"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded transition-colors"
                            title="Delete Category"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Creating / Editing Category */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug:
                          formData.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    placeholder="e.g. Flex Board, Letter Heads"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug / Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. flex-board"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter category description..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Thumbnail Image
                  </label>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-16 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                      <ProductImage
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Image URL or Path (/src/assets/images/...)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors border border-slate-300">
                        <FiUploadCloud className="w-4 h-4 text-orange-600" />
                        <span>{uploadingImage ? "Uploading..." : "Upload Local Image File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FiCheck className="w-4 h-4" />
                    {editingCategory ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
