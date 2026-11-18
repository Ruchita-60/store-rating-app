import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  Shield,
  ShoppingBag,
  User,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../utils/validators';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    breakdown: { admin: 0, user: 0, store_owner: 0 },
  });

  // Data states
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('created_at');
  const [userSortOrder, setUserSortOrder] = useState('DESC');

  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('created_at');
  const [storeSortOrder, setStoreSortOrder] = useState('DESC');

  const [ratingStoreFilter, setRatingStoreFilter] = useState('');
  const [ratingSortOrder, setRatingSortOrder] = useState('DESC');

  // Loading & Alert states
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  });

  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });

  // Fetch functions
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
        // Filter out store owners for store creation dropdown
        const owners = res.data.data.filter((u) => u.role === 'store_owner');
        setStoreOwners(owners);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams({
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      });
      const res = await api.get(`/admin/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const fetchRatings = async () => {
    try {
      const params = new URLSearchParams({
        storeId: ratingStoreFilter,
        sortOrder: ratingSortOrder,
      });
      const res = await api.get(`/admin/ratings?${params.toString()}`);
      if (res.data.success) {
        setRatings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchStores(), fetchRatings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchRatings();
  }, [ratingStoreFilter, ratingSortOrder]);

  // Handle Sort Toggle Helper
  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  // Add User Submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    const nErr = validateName(newUserForm.name);
    const eErr = validateEmail(newUserForm.email);
    const pErr = validatePassword(newUserForm.password);
    const aErr = validateAddress(newUserForm.address);

    if (nErr || eErr || pErr || aErr) {
      setActionError(nErr || eErr || pErr || aErr);
      return;
    }

    try {
      const res = await api.post('/admin/users', newUserForm);
      if (res.data.success) {
        setActionSuccess(res.data.message || 'User added successfully!');
        setIsAddUserModalOpen(false);
        setNewUserForm({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'user',
        });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add user.');
    }
  };

  // Add Store Submission
  const handleAddStore = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    const nErr = validateName(newStoreForm.name);
    const eErr = validateEmail(newStoreForm.email);
    const aErr = validateAddress(newStoreForm.address);

    if (nErr || eErr || aErr) {
      setActionError(nErr || eErr || aErr);
      return;
    }

    try {
      const payload = {
        name: newStoreForm.name.trim(),
        email: newStoreForm.email.trim(),
        address: newStoreForm.address.trim(),
        owner_id: newStoreForm.owner_id ? parseInt(newStoreForm.owner_id, 10) : null,
      };

      const res = await api.post('/admin/stores', payload);
      if (res.data.success) {
        setActionSuccess('Store added successfully!');
        setIsAddStoreModalOpen(false);
        setNewStoreForm({ name: '', email: '', address: '', owner_id: '' });
        fetchStores();
        fetchStats();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add store.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </span>
        );
      case 'store_owner':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShoppingBag className="w-3 h-3" />
            <span>Store Owner</span>
          </span>
        );
      case 'user':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-3 h-3" />
            <span>Normal User</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Top Alerts */}
          {actionSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess('')} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800 text-sm animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="font-medium">{actionError}</span>
              </div>
              <button onClick={() => setActionError('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section: Overview (Stats Cards + Quick Actions) */}
          {(activeTab === 'overview' || activeTab === 'all') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Admin Console</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage users, stores, monitor rating metrics and assign roles
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActionError('');
                      setIsAddStoreModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Store</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionError('');
                      setIsAddUserModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Add User</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadAll}
                    title="Refresh data"
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                  title="Total Registered Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="indigo"
                  subtitle={`${stats.breakdown?.user || 0} Shoppers • ${stats.breakdown?.store_owner || 0} Owners • ${stats.breakdown?.admin || 0} Admins`}
                />
                <StatCard
                  title="Total Registered Stores"
                  value={stats.totalStores}
                  icon={Store}
                  color="emerald"
                  subtitle="Active retail & grocery locations"
                />
                <StatCard
                  title="Submitted Ratings"
                  value={stats.totalRatings}
                  icon={Star}
                  color="amber"
                  subtitle="Verified customer feedbacks"
                />
              </div>
            </div>
          )}

          {/* Section: Stores Directory */}
          {(activeTab === 'stores' || activeTab === 'overview') && (
            <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Stores Directory</h3>
                  <p className="text-xs text-slate-500">View and sort all registered retail stores and overall ratings</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Store Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search store name or address..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56 sm:w-64"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddStoreModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Store</span>
                  </button>
                </div>
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th
                        onClick={() => handleStoreSort('name')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Store Name</span>
                          {storeSortBy === 'name' ? (
                            storeSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleStoreSort('email')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Contact Email</span>
                          {storeSortBy === 'email' ? (
                            storeSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleStoreSort('address')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Address</span>
                          {storeSortBy === 'address' ? (
                            storeSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleStoreSort('averageRating')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Overall Avg Rating</span>
                          {storeSortBy === 'averageRating' ? (
                            storeSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4">Store Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No stores found matching your query.
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                <Store className="w-4 h-4" />
                              </div>
                              <span className="truncate max-w-xs">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.email}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={s.address}>
                            {s.address}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <StarRating value={parseFloat(s.averageRating) || 0} readOnly size="sm" showScore />
                              <span className="text-xs text-slate-400">({s.totalRatings} reviews)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {s.owner_name ? (
                              <span className="inline-flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <ShoppingBag className="w-3 h-3 text-amber-500" />
                                <span className="truncate max-w-[140px]">{s.owner_name}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Users Management */}
          {(activeTab === 'users' || activeTab === 'overview') && (
            <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">User Management</h3>
                  <p className="text-xs text-slate-500">View, search, filter and inspect all registered user profiles</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, email, address..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-60"
                    />
                  </div>

                  {/* Filter by role */}
                  <div className="relative">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    >
                      <option value="">All Roles</option>
                      <option value="user">Normal Users</option>
                      <option value="store_owner">Store Owners</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th
                        onClick={() => handleUserSort('name')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>User Name</span>
                          {userSortBy === 'name' ? (
                            userSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleUserSort('email')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email Address</span>
                          {userSortBy === 'email' ? (
                            userSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleUserSort('address')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Address</span>
                          {userSortBy === 'address' ? (
                            userSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleUserSort('role')}
                        className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1">
                          <span>Role</span>
                          {userSortBy === 'role' ? (
                            userSortOrder === 'ASC' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-xs">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedUserDetail(u)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Ratings Log */}
          {(activeTab === 'ratings' || activeTab === 'overview') && (
            <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Store Ratings & Reviews Audit Log</h3>
                  <p className="text-xs text-slate-500">Live submission records connecting shoppers and store owners</p>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={ratingStoreFilter}
                    onChange={(e) => setRatingStoreFilter(e.target.value)}
                    className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="">All Stores</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setRatingSortOrder(ratingSortOrder === 'DESC' ? 'ASC' : 'DESC')}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{ratingSortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-3 px-4">Store</th>
                      <th className="py-3 px-4">Shopper</th>
                      <th className="py-3 px-4">Rating Given</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ratings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No ratings found.
                        </td>
                      </tr>
                    ) : (
                      ratings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <span className="truncate max-w-xs">{r.store_name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>
                              <p className="font-medium text-slate-800">{r.user_name}</p>
                              <p className="text-xs text-slate-400">{r.user_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <StarRating value={r.rating} readOnly size="sm" showScore />
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {new Date(r.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add Store */}
      {isAddStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Add New Store</h3>
                  <p className="text-xs text-slate-500">Register a new retail store in the system</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStore} className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Store Name</label>
                  <span className="text-[11px] text-slate-400">{newStoreForm.name.length}/60 chars (min 20)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Departmental Superstore"
                  value={newStoreForm.name}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Store Contact Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@storename.com"
                  value={newStoreForm.email}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Store Address</label>
                  <span className="text-[11px] text-slate-400">{newStoreForm.address.length}/400 max</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Physical street address, city, state and zip"
                  value={newStoreForm.address}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Assign Store Owner (Optional)
                </label>
                <select
                  value={newStoreForm.owner_id}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, owner_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="">No Store Owner Assigned (Assign Later)</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Only users with the role 'store_owner' can be assigned as owners.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStoreModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Add New User</h3>
                  <p className="text-xs text-slate-500">Create Admin, Store Owner or Normal User account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  User Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'user', label: 'Normal User', icon: User },
                    { id: 'store_owner', label: 'Store Owner', icon: ShoppingBag },
                    { id: 'admin', label: 'Admin', icon: Shield },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: r.id })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-xs font-medium transition ${
                        newUserForm.role === r.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <r.icon className="w-4 h-4 mb-1" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Full Name</label>
                  <span className="text-[11px] text-slate-400">{newUserForm.name.length}/60 chars (min 20)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Alexander Smith"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Password (8–16 chars, 1 uppercase, 1 special char)
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. SecurePass123!"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Address</label>
                  <span className="text-[11px] text-slate-400">{newUserForm.address.length}/400 max</span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Street address, city, state, postal code"
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: User Details */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedUserDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">User Details Profile</h3>
                  <p className="text-xs text-slate-400">ID #{selectedUserDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedUserDetail.name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5">{selectedUserDetail.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                <div className="mt-1">{getRoleBadge(selectedUserDetail.role)}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</label>
                <p className="text-sm text-slate-700 mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedUserDetail.address}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Created</label>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(selectedUserDetail.created_at).toLocaleString()}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
