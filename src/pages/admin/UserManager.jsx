import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/services/api";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiShield,
  FiTrash2,
  FiEdit,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiKey,
} from "react-icons/fi";

export default function UserManager() {
  const { token, user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Create User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    name: "",
    password: "",
    role: "user",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user",
    newPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchUsersApi(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load user list from database.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!createForm.username.trim() || !createForm.password.trim()) {
      setError("Username and Password are required.");
      return;
    }

    try {
      setIsCreating(true);
      await createUserApi(createForm, token);
      setSuccessMsg(`User '${createForm.username}' created successfully!`);
      setIsCreateOpen(false);
      setCreateForm({ username: "", name: "", password: "", role: "user" });
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || "",
      role: u.role || "user",
      newPassword: "",
    });
    setError("");
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsUpdating(true);
      const payload = {
        name: editForm.name,
        role: editForm.role,
      };
      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword.trim();
      }

      await updateUserApi(editingUser.id || editingUser._id, payload, token);
      setSuccessMsg(`User '${editingUser.username}' updated successfully!`);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (u) => {
    const userId = u.id || u._id;
    if (u.username === "admin") {
      alert("The default root admin account cannot be deleted.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete user "${u.username}"? This action cannot be undone.`
      )
    ) {
      try {
        setError("");
        await deleteUserApi(userId, token);
        setSuccessMsg(`User '${u.username}' was deleted.`);
        loadUsers();
      } catch (err) {
        setError(err.message || "Failed to delete user.");
      }
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(term) ||
      (u.name || "").toLowerCase().includes(term) ||
      (u.role || "").toLowerCase().includes(term)
    );
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const standardCount = users.filter((u) => u.role === "user").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-orange-600" /> User Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create and manage user accounts in the database. For security, all login OTP codes are dispatched exclusively to the <strong>Administrator email</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadUsers()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => {
                setError("");
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <FiUserPlus className="w-4 h-4" />
              Create New User
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Accounts</p>
              <p className="text-2xl font-black text-slate-900">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Administrators</p>
              <p className="text-2xl font-black text-slate-900">{adminCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              <FiUserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Standard Users</p>
              <p className="text-2xl font-black text-slate-900">{standardCount}</p>
            </div>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Search & Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search username, email, name or role..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
              Showing {filteredUsers.length} of {totalUsers} users
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 sm:px-6">User / Login ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-600 rounded-full animate-spin mx-auto mb-2" />
                      Loading users from database...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      No users match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isRootAdmin = u.username === "admin";
                    const isSelf = currentAdmin && (currentAdmin.username === u.username || currentAdmin.id === u.id);

                    return (
                      <tr key={u.id || u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-xs ${
                                u.role === "admin"
                                  ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                                  : "bg-gradient-to-tr from-slate-700 to-slate-900 text-white"
                              }`}
                            >
                              {(u.name || u.username || "U")[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.username}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">Login ID</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {u.name || <span className="text-slate-400 italic">None</span>}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                              <FiShield className="w-3 h-3 text-purple-600" />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              <FiUserCheck className="w-3 h-3 text-blue-600" />
                              Standard User
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "System"}
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit user details, email or reset password"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>

                            {!isRootAdmin && !isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-600 rounded-xl">
                  <FiUserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create New Account</h3>
                  <p className="text-[11px] text-slate-400">Stores user in database (Login OTP sent to Admin)</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / Login ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sales_user or john"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Sales)"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: "user" })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      createForm.role === "user"
                        ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <FiUserCheck className="w-4 h-4 text-blue-600" /> Standard User
                    </div>
                    <span className="text-[10px] text-slate-500">Access quotes, prices & calculators</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: "admin" })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      createForm.role === "admin"
                        ? "border-purple-500 bg-purple-50/70 text-purple-900 ring-2 ring-purple-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <FiShield className="w-4 h-4 text-purple-600" /> Administrator
                    </div>
                    <span className="text-[10px] text-slate-500">Full control over database & users</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isCreating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUserCheck className="w-4 h-4" />
                      Save & Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER / RESET PASSWORD MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-600 rounded-xl">
                  <FiEdit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit User: {editingUser.username}</h3>
                  <p className="text-[11px] text-slate-400">Modify profile or set new password</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter user's name"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password (Leave blank to keep existing)
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Type new password to change..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
