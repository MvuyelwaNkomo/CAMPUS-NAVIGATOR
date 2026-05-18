// client/src/pages/AdminPage.tsx

import { useState, useEffect } from 'react';
import {
  MapPin, Building2, Users, Activity, LogOut, BarChart3,
  FileText, ChevronRight, Plus, Edit, Trash2, RotateCcw,
  AlertTriangle, Shield, CheckCircle, XCircle, Search,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  adminGetStats, adminGetLocations, adminDeleteLocation,
  adminRestoreLocation, adminGetUsers, adminChangeUserRole,
  adminSetUserStatus, adminGetAuditLog
} from '../api/admin';
import AdminMapPinManager from '../components/AdminMapPinManager';
import AdminLocationForm from '../components/AdminLocationForm';

type AdminTab = 'dashboard' | 'locations' | 'pins' | 'users' | 'audit';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]         = useState<AdminTab>('dashboard');
  const [stats,     setStats]             = useState<any>(null);
  const [locations, setLocations]         = useState<any[]>([]);
  const [users,     setUsers]             = useState<any[]>([]);
  const [auditLogs, setAuditLogs]         = useState<any[]>([]);
  const [auditTotal,setAuditTotal]        = useState(0);
  const [auditPage, setAuditPage]         = useState(1);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [showForm,  setShowForm]          = useState(false);
  const [loading,   setLoading]           = useState(false);
  const [userSearch,setUserSearch]        = useState('');
  const [auditFilter,setAuditFilter]      = useState('');

  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (activeTab === 'locations') loadLocations();
    if (activeTab === 'users')     loadUsers();
    if (activeTab === 'audit')     loadAuditLog(1);
  }, [activeTab]);

  async function loadStats() {
    try { setStats(await adminGetStats()); } catch {}
  }

  async function loadLocations() {
    setLoading(true);
    try { setLocations(await adminGetLocations()); }
    finally { setLoading(false); }
  }

  async function loadUsers() {
    setLoading(true);
    try { setUsers(await adminGetUsers()); }
    finally { setLoading(false); }
  }

  async function loadAuditLog(page: number) {
    setLoading(true);
    try {
      const data = await adminGetAuditLog(page, 20, auditFilter || undefined);
      setAuditLogs(data.logs);
      setAuditTotal(data.total);
      setAuditPage(page);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this location? It will be hidden from students.')) return;
    await adminDeleteLocation(id);
    loadLocations();
    loadStats();
  }

  async function handleRestore(id: string) {
    await adminRestoreLocation(id);
    loadLocations();
    loadStats();
  }

  async function handleRoleChange(userId: string, currentRole: string) {
    const newRole = currentRole === 'student' ? 'admin' : 'student';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    await adminChangeUserRole(userId, newRole);
    loadUsers();
  }

  async function handleStatusChange(userId: string, isActive: boolean) {
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this account?`)) return;
    await adminSetUserStatus(userId, !isActive);
    loadUsers();
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.student_number || '').includes(userSearch)
  );

  const totalAuditPages = Math.ceil(auditTotal / 20);

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard',      icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'locations' as AdminTab, label: 'Locations',       icon: <Building2 className="w-4 h-4" /> },
    { id: 'pins'      as AdminTab, label: 'Map Pin Manager', icon: <MapPin className="w-4 h-4" /> },
    { id: 'users'     as AdminTab, label: 'Users',           icon: <Users className="w-4 h-4" />,    superAdminOnly: true },
    { id: 'audit'     as AdminTab, label: 'Audit Log',       icon: <FileText className="w-4 h-4" />, superAdminOnly: true }
  ];

  const inputClass = "h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
            {user?.role} · {user?.first_name} {user?.last_name}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.filter(item => !item.superAdminOnly || isSuperAdmin).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
              {activeTab === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
              {stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Locations', value: stats.total_locations,   color: 'blue',   icon: <Building2 className="w-5 h-5" /> },
                    { label: 'Pinned on Map',   value: stats.pinned_count,      color: 'green',  icon: <MapPin className="w-5 h-5" /> },
                    { label: 'Unpinned',         value: stats.unpinned_count,    color: stats.unpinned_count > 0 ? 'amber' : 'green', icon: <AlertTriangle className="w-5 h-5" /> },
                    { label: 'Active Students',  value: stats.active_students,   color: 'purple', icon: <Users className="w-5 h-5" /> },
                    { label: 'Academic',         value: stats.academic_count,    color: 'blue',   icon: <Building2 className="w-5 h-5" /> },
                    { label: 'Residential',      value: stats.residential_count, color: 'purple', icon: <Building2 className="w-5 h-5" /> },
                    { label: 'Active Admins',    value: stats.active_admins,     color: 'teal',   icon: <Shield className="w-5 h-5" /> },
                    { label: 'Pending Changes',  value: stats.pending_changes,   color: 'orange', icon: <Activity className="w-5 h-5" /> }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {stats?.unpinned_count > 0 && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {stats.unpinned_count} location{stats.unpinned_count > 1 ? 's are' : ' is'} not yet pinned on the campus map.
                    </p>
                    <button onClick={() => setActiveTab('pins')} className="text-xs text-amber-600 hover:underline mt-0.5">
                      Go to Map Pin Manager →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Locations ── */}
          {activeTab === 'locations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Locations</h2>
                <button
                  onClick={() => { setEditingLocation(null); setShowForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Location
                </button>
              </div>

              {showForm && (
                <AdminLocationForm
                  location={editingLocation}
                  onSave={() => { setShowForm(false); loadLocations(); loadStats(); }}
                  onCancel={() => setShowForm(false)}
                />
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        {['Name', 'Category', 'Region', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {locations.map(loc => (
                        <tr key={loc.id} className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${!loc.is_active ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{loc.name}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{loc.category_label}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{loc.region_label || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${loc.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {loc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setEditingLocation(loc); setShowForm(true); }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              ><Edit className="w-3.5 h-3.5" /></button>
                              {loc.is_active
                                ? <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                : <button onClick={() => handleRestore(loc.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Map Pins ── */}
          {activeTab === 'pins' && <AdminMapPinManager />}

          {/* ── User Management ── */}
          {activeTab === 'users' && isSuperAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h2>

              {/* Search */}
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email or student number..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className={`${inputClass} pl-9 w-full`}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        {['Name', 'Email', 'Student No.', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.student_number || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              u.role === 'admin'      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              u.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            {u.role !== 'superadmin' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRoleChange(u.id, u.role)}
                                  className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title={u.role === 'student' ? 'Promote to Admin' : 'Demote to Student'}
                                >
                                  {u.role === 'student' ? '↑ Make Admin' : '↓ Make Student'}
                                </button>
                                <button
                                  onClick={() => handleStatusChange(u.id, u.is_active)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    u.is_active
                                      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  }`}
                                  title={u.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {u.is_active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Audit Log ── */}
          {activeTab === 'audit' && isSuperAdmin && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Audit Log</h2>

              {/* Filter */}
              <div className="flex items-center gap-3 mb-4">
                <select
                  value={auditFilter}
                  onChange={e => { setAuditFilter(e.target.value); loadAuditLog(1); }}
                  className={inputClass}
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="FAILED_LOGIN">Failed Login</option>
                  <option value="CREATE_LOCATION">Create Location</option>
                  <option value="UPDATE_LOCATION">Update Location</option>
                  <option value="DELETE_LOCATION">Delete Location</option>
                  <option value="PIN_LOCATION">Pin Location</option>
                  <option value="UPDATE_PIN">Update Pin</option>
                  <option value="DELETE_PIN">Delete Pin</option>
                  <option value="CREATE_USER">Create User</option>
                  <option value="CHANGE_ROLE">Change Role</option>
                  <option value="PASSWORD_RESET">Password Reset</option>
                </select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {auditTotal} total records
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          {['Timestamp', 'User', 'Action', 'Description', 'IP Address'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                              No audit records found
                            </td>
                          </tr>
                        ) : auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                              {log.user_name || '—'}<br/>
                              <span className="text-gray-400">{log.user_email || 'System'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                log.action.includes('FAILED') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                log.action.includes('DELETE') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                log.action.includes('CREATE') || log.action.includes('PIN') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">
                              {log.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                              {log.ip_address || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalAuditPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {auditPage} of {totalAuditPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadAuditLog(auditPage - 1)}
                          disabled={auditPage === 1}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => loadAuditLog(auditPage + 1)}
                          disabled={auditPage === totalAuditPages}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
