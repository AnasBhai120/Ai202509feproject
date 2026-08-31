import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useFitness } from '../../context/FitnessContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Shield,
  Ban,
  Trash2,
  Eye,
  UserCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { showToast } = useFitness();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    gender: 'Male',
    age: 26,
    height: 175,
    weight: 72,
    fitnessGoal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    status: 'active' as 'active' | 'blocked',
    profileImage: '',
  });

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.users.getAll({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res && res.data && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await api.users.create(newUserForm);
      showToast('New user account created successfully!', 'success');
      setIsAddModalOpen(false);
      // Reset form
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        gender: 'Male',
        age: 26,
        height: 175,
        weight: 72,
        fitnessGoal: 'Muscle Gain',
        activityLevel: 'Moderately Active',
        status: 'active',
        profileImage: '',
      });
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await api.users.toggleStatus(user._id);
      showToast(res.message, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleChangeRole = async (user: User, newRole: 'user' | 'admin') => {
    try {
      const res = await api.users.changeRole(user._id, newRole);
      showToast(res.message, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Role change failed', 'error');
    }
  };

  const handleDeleteUser = async (id: string, userEmail?: string) => {
    if (userEmail === 'admin@fitness.com') {
      showToast('The master demo administrator account cannot be deleted.', 'error');
      return;
    }
    try {
      const res = await api.users.deleteUser(id);
      showToast(res.message, 'success');
      loadUsers();
      if (selectedUser?._id === id) setSelectedUser(null);
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = u.name ? u.name.toLowerCase().includes(query) : false;
    const emailMatch = u.email ? u.email.toLowerCase().includes(query) : false;
    const goalMatch = u.fitnessGoal ? u.fitnessGoal.toLowerCase().includes(query) : false;
    return nameMatch || emailMatch || goalMatch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Athletes & Users</h1>
          <p className="text-xs text-white/40 mt-0.5">
            Inspect athlete biometrics, manage memberships, toggle permissions, or add new athlete accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-[#181818] hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/5"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D9FF00]' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(217,255,0,0.3)] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search athletes by name, email, or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#D9FF00]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
          >
            <option value="all">All Roles</option>
            <option value="user">Athletes (Users)</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#181818] text-white/40 font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-4 py-3.5">Athlete</th>
                <th className="px-4 py-3.5">Goal & Activity</th>
                <th className="px-4 py-3.5">Biometrics</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#D9FF00]" />
                      <span className="text-xs">Loading athlete directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-white/20" />
                      <span className="text-sm font-semibold text-white/60">No athletes or users found</span>
                      <p className="text-xs text-white/30 max-w-sm">
                        Try adjusting your search criteria or click "Add New User" above to register an athlete.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Athlete Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.profileImage ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">{u.name}</div>
                          <div className="text-[11px] text-white/40 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#D9FF00] block">{u.fitnessGoal || 'General Fitness'}</span>
                      <span className="text-[11px] text-white/40">{u.activityLevel || 'Sedentary'}</span>
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-3.5">
                      <div className="text-white font-mono">
                        {u.weight || 70} kg • {u.height || 175} cm
                      </div>
                      <div className="text-[11px] text-white/40">{u.gender || 'Male'} • {u.age || 25} yrs</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-[#D9FF00]/10 text-[#D9FF00] border-[#D9FF00]/30'
                            : 'bg-white/5 text-white/60 border-white/10'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'text-[#D9FF00] bg-[#D9FF00]/10'
                            : 'text-red-400 bg-red-500/10'
                        }`}
                      >
                        {u.status === 'active' ? '● Active' : '✖ Blocked'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.email === 'admin@fitness.com'}
                          className={`p-2 rounded-xl transition-colors ${
                            u.email === 'admin@fitness.com'
                              ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/30'
                              : u.status === 'active'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                              : 'bg-[#D9FF00]/10 hover:bg-[#D9FF00]/20 text-[#D9FF00]'
                          }`}
                          title={
                            u.email === 'admin@fitness.com'
                              ? 'Master Administrator cannot be blocked'
                              : u.status === 'active'
                              ? 'Block Account'
                              : 'Unblock Account'
                          }
                        >
                          {u.status === 'active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleChangeRole(u, u.role === 'admin' ? 'user' : 'admin')}
                          disabled={u.email === 'admin@fitness.com'}
                          className={`p-2 rounded-xl transition-colors ${
                            u.email === 'admin@fitness.com'
                              ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/30'
                              : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400'
                          }`}
                          title={
                            u.email === 'admin@fitness.com'
                              ? 'Primary Master Admin (Protected)'
                              : u.role === 'admin'
                              ? 'Demote to User'
                              : 'Promote to Admin'
                          }
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u._id, u.email)}
                          disabled={u.email === 'admin@fitness.com'}
                          className={`p-2 rounded-xl transition-colors ${
                            u.email === 'admin@fitness.com'
                              ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/30'
                              : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                          }`}
                          title={u.email === 'admin@fitness.com' ? 'Protected Account' : 'Delete User'}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Athlete / User"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 -m-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="athlete@pulsefit.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Password (Default: password123)</label>
                <input
                  type="password"
                  placeholder="Leave empty for password123"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Account Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="user">Athlete (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Fitness Goal</label>
                <select
                  value={newUserForm.fitnessGoal}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fitnessGoal: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Activity Level</label>
                <select
                  value={newUserForm.activityLevel}
                  onChange={(e) => setNewUserForm({ ...newUserForm, activityLevel: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Sedentary">Sedentary (desk job)</option>
                  <option value="Lightly Active">Lightly Active (1-3 days/wk)</option>
                  <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                  <option value="Very Active">Very Active (6-7 days/wk)</option>
                  <option value="Extremely Active">Extremely Active (Athletic training)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Gender</label>
                <select
                  value={newUserForm.gender}
                  onChange={(e) => setNewUserForm({ ...newUserForm, gender: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#D9FF00]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Age</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={newUserForm.age}
                    onChange={(e) => setNewUserForm({ ...newUserForm, age: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={newUserForm.height}
                    onChange={(e) => setNewUserForm({ ...newUserForm, height: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={newUserForm.weight}
                    onChange={(e) => setNewUserForm({ ...newUserForm, weight: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#D9FF00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-full bg-white/5 text-xs text-white/60 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 rounded-full bg-[#D9FF00] hover:bg-[#D9FF00]/90 text-black text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(217,255,0,0.3)] disabled:opacity-50"
              >
                {isCreating ? 'Creating User...' : 'Create Athlete Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Athlete Dossier: ${selectedUser.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 -m-1">
            <div className="flex items-center gap-4 bg-[#181818] p-4 rounded-2xl border border-white/5">
              <img
                src={
                  selectedUser.profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover border border-white/10"
              />
              <div>
                <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                <p className="text-xs text-white/40 font-mono">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-[#D9FF00]/20 text-[#D9FF00]">
                    {selectedUser.role}
                  </span>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#181818] p-3 rounded-2xl border border-white/5">
                <span className="text-white/40 block font-medium">Height & Weight</span>
                <span className="text-white font-bold font-mono">{selectedUser.height || 175} cm / {selectedUser.weight || 70} kg</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-2xl border border-white/5">
                <span className="text-white/40 block font-medium">Goal</span>
                <span className="text-[#D9FF00] font-bold">{selectedUser.fitnessGoal}</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-2xl border border-white/5">
                <span className="text-white/40 block font-medium">Activity Level</span>
                <span className="text-white font-bold">{selectedUser.activityLevel}</span>
              </div>
              <div className="bg-[#181818] p-3 rounded-2xl border border-white/5">
                <span className="text-white/40 block font-medium">Member Since</span>
                <span className="text-white font-bold font-mono">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

