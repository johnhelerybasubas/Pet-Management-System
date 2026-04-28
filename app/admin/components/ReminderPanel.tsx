'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, Check, X, User, Bell } from 'lucide-react';

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_user_id?: string;
  send_to_all: boolean;
  status: 'active' | 'resolved';
  created_at: string;
  target_user?: {
    email: string;
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  petName: string | null;
  petType: string | null;
  status: string;
  joinedDate: string;
}

export default function EmergencyAlertPanel() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EmergencyAlert | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as EmergencyAlert['severity'],
    targetUserId: '',
    sendToAll: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
        const [alertsResponse, usersResponse] = await Promise.all([
          fetch('/api/admin/reminders', {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setAlerts(alertsData);
        }

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const severityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  };

  const severityIcons = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '�',
    critical: '�',
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
      const response = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          targetUserId: formData.targetUserId || null,
          sendToAll: formData.sendToAll,
          createdBy: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts([data, ...alerts]);
        setShowForm(false);
        setFormData({ title: '', description: '', severity: 'medium', targetUserId: '', sendToAll: false });
      } else {
        alert('Failed to create emergency alert');
      }
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      alert('Failed to create emergency alert');
    }
  };

  const handleEdit = (alert: EmergencyAlert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      targetUserId: alert.target_user_id || '',
      sendToAll: alert.send_to_all,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (editingAlert) {
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
        const response = await fetch('/api/admin/reminders', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            alertId: editingAlert.id,
            title: formData.title,
            description: formData.description,
            severity: formData.severity,
            targetUserId: formData.targetUserId || null,
            sendToAll: formData.sendToAll,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAlerts(alerts.map((a) => (a.id === editingAlert.id ? data : a)));
          setEditingAlert(null);
          setShowForm(false);
          setFormData({ title: '', description: '', severity: 'medium', targetUserId: '', sendToAll: false });
        } else {
          alert('Failed to update emergency alert');
        }
      } catch (error) {
        console.error('Error updating emergency alert:', error);
        alert('Failed to update emergency alert');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this emergency alert?')) {
      try {
        const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
        const response = await fetch(`/api/admin/reminders?alertId=${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          setAlerts(alerts.filter((a) => a.id !== id));
        } else {
          alert('Failed to delete emergency alert');
        }
      } catch (error) {
        console.error('Error deleting emergency alert:', error);
        alert('Failed to delete emergency alert');
      }
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
      const response = await fetch('/api/admin/reminders', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId: id, status: 'resolved' }),
      });

      if (response.ok) {
        setAlerts(
          alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a))
        );
        alert('Emergency alert resolved successfully!');
      } else {
        alert('Failed to resolve emergency alert');
      }
    } catch (error) {
      console.error('Error resolving emergency alert:', error);
      alert('Failed to resolve emergency alert');
    }
  };

  const handleSendAlertToUser = async (userId: string, userName: string) => {
    const title = prompt(`Enter alert title for ${userName}:`, 'Emergency Alert');
    if (!title) return;

    const description = prompt('Enter alert description:', 'This is an important notification.');
    if (!description) return;

    try {
      const token = localStorage.getItem('auth_token') || 'mock-token-' + Date.now();
      const response = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          severity: 'high',
          targetUserId: userId,
          sendToAll: false,
          createdBy: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts([data, ...alerts]);
        alert(`Alert sent to ${userName} successfully!`);
      } else {
        alert('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send alert');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAlert) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Emergency Alerts</h3>
          <p className="text-sm text-slate-600">Create and manage emergency alerts for users</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-900">
                {editingAlert ? 'Edit Alert' : 'New Emergency Alert'}
              </h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAlert(null);
                  setFormData({ title: '', description: '', severity: 'medium', targetUserId: '', sendToAll: false });
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as EmergencyAlert['severity'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={formData.sendToAll}
                  onChange={(e) => setFormData({ ...formData, sendToAll: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium text-slate-700">
                  Send to all users
                </label>
              </div>
              {!formData.sendToAll && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target User ID</label>
                  <input
                    type="text"
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="User UUID"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingAlert ? 'Update' : 'Create Alert'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAlert(null);
                    setFormData({ title: '', description: '', severity: 'medium', targetUserId: '', sendToAll: false });
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="grid gap-4">
        {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl p-5 border-l-4 shadow-sm ${
                alert.status === 'resolved' ? 'border-green-500' : 
                alert.severity === 'critical' ? 'border-red-500' :
                alert.severity === 'high' ? 'border-orange-500' :
                alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{severityIcons[alert.severity]}</span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${severityColors[alert.severity]}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                  {alert.send_to_all ? (
                    <p className="text-xs text-slate-500">To: All users</p>
                  ) : alert.target_user && (
                    <p className="text-xs text-slate-500">To: {alert.target_user.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Resolve Alert"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(alert)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    alert.status === 'resolved' ? 'text-green-600' : 'text-slate-500'
                  }`}
                >
                  {alert.status === 'resolved' ? '✓ Resolved' : '⚠️ Active'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Users List for Quick Alerts */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-slate-600" />
          <h4 className="font-semibold text-slate-900">Send Alert to User</h4>
        </div>
        <div className="grid gap-3">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No users found</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendAlertToUser(user.id, user.name)}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Bell className="w-4 h-4" />
                  Alert
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
