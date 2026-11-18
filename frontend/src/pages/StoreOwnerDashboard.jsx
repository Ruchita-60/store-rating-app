import React, { useState, useEffect } from 'react';
import {
  Store,
  Star,
  Users,
  Award,
  TrendingUp,
  MapPin,
  Mail,
  Calendar,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import api from '../api/axios';

const StoreOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('store_overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [hasStore, setHasStore] = useState(false);
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/store-owner/dashboard');
      if (res.data.success) {
        setHasStore(res.data.hasStore);
        setStore(res.data.store);
        setStats(res.data.stats);
        setRatings(res.data.ratings || []);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
      setError('Unable to load your store information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2.5 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!hasStore && !loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Store Assigned Yet</h3>
              <p className="text-sm text-slate-500 mt-2">
                Your account is registered as a Store Owner, but the system administrator has not yet linked a retail store to your account.
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 text-left">
                <p className="font-semibold text-slate-700 mb-1">What to do next:</p>
                <p>Please contact the system administrator at <span className="font-medium text-indigo-600">admin@storerating.com</span> to link your store profile to this account.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Store Header Card */}
              {store && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-200">
                      <Store className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {store.name}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified Store
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{store.email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="max-w-xs truncate">{store.address}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Store Average</p>
                      <p className="text-2xl font-black text-amber-700">{stats.averageRating} <span className="text-sm font-normal text-amber-500">/ 5</span></p>
                    </div>
                    <StarRating value={stats.averageRating} readOnly size="md" />
                  </div>
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                  title="Average Store Rating"
                  value={`${stats.averageRating} ★`}
                  icon={Award}
                  color="amber"
                  subtitle="Calculated across all customer reviews"
                />
                <StatCard
                  title="Total Ratings Received"
                  value={stats.totalRatings}
                  icon={Users}
                  color="indigo"
                  subtitle="Unique verified shopper evaluations"
                />
                <StatCard
                  title="Customer Sentiment"
                  value={stats.averageRating >= 4 ? 'Excellent' : stats.averageRating >= 3 ? 'Good' : 'Needs Attention'}
                  icon={TrendingUp}
                  color="emerald"
                  subtitle="Based on review distribution"
                />
              </div>

              {/* Rating Distribution Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-4">Customer Rating Breakdown</h3>
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = stats.ratingDistribution?.[starNum] || 0;
                    const percentage = stats.totalRatings > 0 ? Math.round((count / stats.totalRatings) * 100) : 0;

                    return (
                      <div key={starNum} className="flex items-center space-x-3 text-xs">
                        <span className="w-14 font-semibold text-slate-600 flex items-center space-x-1">
                          <span>{starNum}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </span>

                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <span className="w-12 text-right font-medium text-slate-500">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ratings List: Users who submitted ratings */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Customer Ratings & Reviews</h3>
                    <p className="text-xs text-slate-500">
                      Displaying customer name, submitted rating, and submission timestamp
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {ratings.length} Reviews
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
                      <tr>
                        <th className="py-3 px-4">Shopper Name</th>
                        <th className="py-3 px-4">Shopper Email</th>
                        <th className="py-3 px-4">Rating Given</th>
                        <th className="py-3 px-4">Submission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ratings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            No ratings submitted for this store yet.
                          </td>
                        </tr>
                      ) : (
                        ratings.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                  {r.user_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate max-w-xs">{r.user_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{r.user_email}</td>
                            <td className="py-3 px-4">
                              <StarRating value={r.rating} readOnly size="sm" showScore />
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                              <div className="flex items-center space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(r.created_at).toLocaleDateString()}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
