import React, { useState, useEffect } from 'react';
import {
  Store,
  Star,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Sparkles,
  Edit3,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StarRating from '../components/StarRating';
import StatCard from '../components/StatCard';
import api from '../api/axios';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('explore_stores');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stores, setStores] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Rating Modal state
  const [ratingModalStore, setRatingModalStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams({ search, sortBy, sortOrder });
      const res = await api.get(`/user/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const fetchMyRatings = async () => {
    try {
      const res = await api.get('/user/my-ratings');
      if (res.data.success) {
        setMyRatings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching user ratings:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStores(), fetchMyRatings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  // Open modal to submit or update rating
  const handleOpenRatingModal = (store) => {
    setActionError('');
    setRatingModalStore(store);
    setSelectedRating(store.myRating || 5);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingModalStore) return;

    setSubmittingRating(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post('/user/ratings', {
        storeId: ratingModalStore.id,
        rating: selectedRating,
      });

      if (res.data.success) {
        setActionSuccess(res.data.message || 'Rating submitted successfully!');
        setRatingModalStore(null);
        await Promise.all([fetchStores(), fetchMyRatings()]);
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || 'Failed to submit rating.'
      );
    } finally {
      setSubmittingRating(false);
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

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard
              title="Available Stores"
              value={stores.length}
              icon={Store}
              color="indigo"
              subtitle="Registered stores open for feedback"
            />
            <StatCard
              title="My Submitted Reviews"
              value={myRatings.length}
              icon={Star}
              color="emerald"
              subtitle={`You have rated ${myRatings.length} of ${stores.length} stores`}
            />
          </div>

          {/* Tab 1: Explore Stores */}
          {activeTab === 'explore_stores' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Browse & Rate Stores</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Search registered stores, view overall ratings and submit your personal rating
                    </p>
                  </div>

                  {/* Search and Sort controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by store name or address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60 sm:w-72"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="averageRating">Sort by Avg Rating</option>
                        <option value="myRating">Sort by My Rating</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition"
                        title="Toggle Ascending / Descending"
                      >
                        {sortOrder === 'ASC' ? <ArrowUp className="w-4 h-4 text-indigo-600" /> : <ArrowDown className="w-4 h-4 text-indigo-600" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stores Grid / Cards */}
                {stores.length === 0 ? (
                  <div className="py-12 text-center">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No stores match your search criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {stores.map((store) => {
                      const hasUserRated = store.myRating !== null && store.myRating !== undefined;

                      return (
                        <div
                          key={store.id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-xs">
                                  <Store className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1" title={store.name}>
                                    {store.name}
                                  </h3>
                                  <p className="text-xs text-slate-400 mt-0.5">{store.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start space-x-2 text-xs text-slate-600 my-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2" title={store.address}>{store.address}</span>
                            </div>

                            {/* Overall Average Rating */}
                            <div className="my-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Overall Rating
                              </span>
                              <div className="flex items-center space-x-1.5">
                                <StarRating
                                  value={parseFloat(store.averageRating) || 0}
                                  readOnly
                                  size="sm"
                                  showScore
                                />
                                <span className="text-[11px] text-slate-400">({store.totalRatings})</span>
                              </div>
                            </div>

                            {/* User's Previous Rating Display */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-600">Your Rating:</span>
                              {hasUserRated ? (
                                <div className="flex items-center space-x-1.5">
                                  <StarRating value={store.myRating} readOnly size="sm" />
                                  <span className="text-xs font-bold text-indigo-600">({store.myRating}/5)</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Not rated yet</span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleOpenRatingModal(store)}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-xs ${
                                hasUserRated
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                              }`}
                            >
                              {hasUserRated ? (
                                <>
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Update My Rating</span>
                                </>
                              ) : (
                                <>
                                  <Star className="w-3.5 h-3.5" />
                                  <span>Rate This Store</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: My Ratings History */}
          {activeTab === 'my_ratings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">My Ratings History</h3>
                <p className="text-xs text-slate-500">All retail store ratings you have submitted</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-3 px-4">Store Name</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Your Rating</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRatings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          You have not submitted any store ratings yet.
                        </td>
                      </tr>
                    ) : (
                      myRatings.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {r.store_name}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={r.store_address}>
                            {r.store_address}
                          </td>
                          <td className="py-3 px-4">
                            <StarRating value={r.rating} readOnly size="sm" showScore />
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {new Date(r.updated_at || r.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenRatingModal({
                                  id: r.store_id,
                                  name: r.store_name,
                                  address: r.store_address,
                                  myRating: r.rating,
                                });
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modify</span>
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
        </main>
      </div>

      {/* Interactive Rating Modal */}
      {ratingModalStore && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Star className="w-5 h-5 fill-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {ratingModalStore.myRating ? 'Update Your Rating' : 'Rate This Store'}
                  </h3>
                  <p className="text-xs text-slate-500">Share your honest shopping experience</p>
                </div>
              </div>
              <button
                onClick={() => setRatingModalStore(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="p-6 text-center space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{ratingModalStore.name}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto truncate">
                  {ratingModalStore.address}
                </p>
              </div>

              {/* Star interactive selection */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                <StarRating
                  value={selectedRating}
                  onChange={setSelectedRating}
                  size="xl"
                />
                <span className="text-sm font-bold text-slate-700 mt-3">
                  {selectedRating === 1 && '⭐ Poor (1 Star)'}
                  {selectedRating === 2 && '⭐⭐ Fair (2 Stars)'}
                  {selectedRating === 3 && '⭐⭐⭐ Good (3 Stars)'}
                  {selectedRating === 4 && '⭐⭐⭐⭐ Very Good (4 Stars)'}
                  {selectedRating === 5 && '⭐⭐⭐⭐⭐ Excellent (5 Stars)'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click on any star to select a rating between 1 and 5
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRatingModalStore(null)}
                  disabled={submittingRating}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center space-x-2"
                >
                  {submittingRating && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{ratingModalStore.myRating ? 'Update Rating' : 'Submit Rating'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
