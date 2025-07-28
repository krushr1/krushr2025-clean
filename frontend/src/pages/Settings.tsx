import Layout from '../components/project/Layout'
import { Bell, Shield, Palette, Globe, User, Moon, Sun, Download, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { FloatingInput } from '../components/ui/floating-input'
import { trpc } from '../lib/trpc'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { isCelebrationEnabled, setCelebrationEnabled } from '../hooks/useConfetti'

/**
 * Settings page component for application and user preferences
 * Provides configuration options for profile, notifications, appearance, security, and regional settings
 * Connected to tRPC backend for real-time updates
 */
export default function Settings() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    avatar: '',
    timezone: '',
    dateFormat: '',
    language: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)
  
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  
  const userQuery = trpc.user.me.useQuery()
  const preferencesQuery = trpc.user.getPreferences.useQuery()
  const sessionsQuery = trpc.user.getActiveSessions.useQuery()
  
  const updateProfileMutation = trpc.user.updateProfile.useMutation()
  const updatePasswordMutation = trpc.user.updatePassword.useMutation()
  const updatePreferencesMutation = trpc.user.updatePreferences.useMutation()
  const exportDataMutation = trpc.user.exportData.useMutation()
  const revokeSessionMutation = trpc.user.revokeSession.useMutation()
  
  useEffect(() => {
    if (userQuery.data) {
      setCurrentUser(userQuery.data)
      setProfileForm({
        name: userQuery.data.name || '',
        avatar: userQuery.data.avatar || '',
        timezone: userQuery.data.timezone || 'UTC',
        dateFormat: userQuery.data.dateFormat || 'MM/DD/YYYY',
        language: userQuery.data.language || 'en'
      })
    }
  }, [userQuery.data])
  
  useEffect(() => {
    if (preferencesQuery.data) {
      setPreferences(preferencesQuery.data)
    }
  }, [preferencesQuery.data])
  
  useEffect(() => {
    if (sessionsQuery.data) {
      setActiveSessions(sessionsQuery.data)
    }
  }, [sessionsQuery.data])
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfileMutation.mutateAsync(profileForm)
      toast.success('Profile updated successfully')
      userQuery.refetch()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Password updated successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    }
  }
  
  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      await updatePreferencesMutation.mutateAsync({ [key]: value })
      setPreferences({ ...preferences, [key]: value })
      toast.success('Preference updated')
    } catch (error) {
      toast.error('Failed to update preference')
    }
  }
  
  const handleExportData = async () => {
    try {
      const result = await exportDataMutation.mutateAsync()
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      const exportFileDefaultName = `krushr-data-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }
  
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync({ sessionId })
      toast.success('Session revoked')
      sessionsQuery.refetch()
    } catch (error) {
      toast.error('Failed to revoke session')
    }
  }
  
  if (userQuery.isLoading || preferencesQuery.isLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-krushr-coral-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </Layout>
    )
  }
  
  const settingsGroups = [
    {
      title: 'Profile Settings',
      icon: User,
      settings: [
        { name: 'Personal Information', description: 'Update your profile details', type: 'link', action: () => setShowProfileModal(true) },
        { name: 'Change Password', description: 'Update your account password', type: 'link', action: () => setShowPasswordModal(true) },
        { name: 'Active Sessions', description: 'Manage your active sessions', type: 'link', action: () => setShowSessionsModal(true) }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { 
          name: 'Desktop Notifications', 
          description: 'Get notified on your desktop', 
          type: 'toggle', 
          enabled: preferences?.desktopNotifications ?? true,
          onChange: (value: boolean) => handlePreferenceChange('desktopNotifications', value)
        },
        { 
          name: 'Email Notifications', 
          description: 'Receive notifications via email', 
          type: 'toggle', 
          enabled: preferences?.emailNotifications ?? true,
          onChange: (value: boolean) => handlePreferenceChange('emailNotifications', value)
        },
        { 
          name: 'Task Assignments', 
          description: 'Notify me about task assignments', 
          type: 'toggle', 
          enabled: preferences?.notifyTaskAssignments ?? true,
          onChange: (value: boolean) => handlePreferenceChange('notifyTaskAssignments', value)
        },
        { 
          name: 'Comments & Mentions', 
          description: 'Notify me about comments and mentions', 
          type: 'toggle', 
          enabled: preferences?.notifyCommentsMentions ?? true,
          onChange: (value: boolean) => handlePreferenceChange('notifyCommentsMentions', value)
        },
        { 
          name: 'Team Invitations', 
          description: 'Notify me about team invitations', 
          type: 'toggle', 
          enabled: preferences?.notifyTeamInvitations ?? true,
          onChange: (value: boolean) => handlePreferenceChange('notifyTeamInvitations', value)
        },
        { 
          name: 'Project Deadlines', 
          description: 'Notify me about project deadlines', 
          type: 'toggle', 
          enabled: preferences?.notifyProjectDeadlines ?? true,
          onChange: (value: boolean) => handlePreferenceChange('notifyProjectDeadlines', value)
        },
        { 
          name: 'File Uploads', 
          description: 'Notify me about file uploads', 
          type: 'toggle', 
          enabled: preferences?.notifyFileUploads ?? false,
          onChange: (value: boolean) => handlePreferenceChange('notifyFileUploads', value)
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        { 
          name: 'Theme', 
          description: 'Choose your preferred theme', 
          type: 'select', 
          options: ['light', 'dark', 'system'],
          value: preferences?.theme ?? 'system',
          onChange: (value: string) => handlePreferenceChange('theme', value)
        },
        { 
          name: 'Color Scheme', 
          description: 'Customize your color preferences', 
          type: 'select', 
          options: ['blue', 'green', 'purple', 'orange'],
          value: preferences?.colorScheme ?? 'blue',
          onChange: (value: string) => handlePreferenceChange('colorScheme', value)
        },
        { 
          name: 'Compact Mode', 
          description: 'Use a more compact interface', 
          type: 'toggle', 
          enabled: preferences?.compactMode ?? false,
          onChange: (value: boolean) => handlePreferenceChange('compactMode', value)
        },
        { 
          name: 'Task Completion Celebrations', 
          description: 'Show confetti and sound when tasks are completed', 
          type: 'toggle', 
          enabled: isCelebrationEnabled(),
          onChange: (value: boolean) => {
            setCelebrationEnabled(value)
            toast.success(`Celebrations ${value ? 'enabled' : 'disabled'}`)
          }
        }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      settings: [
        { name: 'Two-Factor Authentication', description: 'Add an extra layer of security (Coming Soon)', type: 'toggle', enabled: false, disabled: true },
        { name: 'Session Management', description: 'Manage your active sessions', type: 'link', action: () => setShowSessionsModal(true) },
        { name: 'Change Password', description: 'Update your account password', type: 'link', action: () => setShowPasswordModal(true) }
      ]
    },
    {
      title: 'Language & Region',
      icon: Globe,
      settings: [
        { 
          name: 'Language', 
          description: 'Choose your preferred language', 
          type: 'select', 
          options: ['en', 'es', 'fr', 'de'],
          optionLabels: ['English', 'Spanish', 'French', 'German'],
          value: currentUser?.language ?? 'en',
          onChange: (value: string) => setProfileForm({...profileForm, language: value})
        },
        { 
          name: 'Timezone', 
          description: 'Set your local timezone', 
          type: 'select', 
          options: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1'],
          optionLabels: ['UTC-8 (PST)', 'UTC-5 (EST)', 'UTC+0 (GMT)', 'UTC+1 (CET)'],
          value: currentUser?.timezone ?? 'UTC',
          onChange: (value: string) => setProfileForm({...profileForm, timezone: value})
        },
        { 
          name: 'Date Format', 
          description: 'Choose how dates are displayed', 
          type: 'select', 
          options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
          value: currentUser?.dateFormat ?? 'MM/DD/YYYY',
          onChange: (value: string) => setProfileForm({...profileForm, dateFormat: value})
        }
      ]
    }
  ]

  return (
    <Layout>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Settings Groups */}
          <div className="space-y-8">
            {settingsGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white rounded-lg border border-gray-200">
                {/* Group Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <group.icon className="w-5 h-5 text-krushr-coral-red" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
                  </div>
                </div>

                {/* Settings List */}
                <div className="divide-y divide-gray-200">
                  {group.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{setting.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>
                      <div className="ml-6">
                        {setting.type === 'toggle' && (
                          <button
                            disabled={(setting as any).disabled}
                            onClick={() => (setting as any).onChange && (setting as any).onChange(!(setting as any).enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              (setting as any).enabled ? 'bg-krushr-coral-red' : 'bg-gray-200'
                            } ${(setting as any).disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                (setting as any).enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                        {setting.type === 'select' && (setting as any).options && (
                          <select 
                            value={(setting as any).value || (setting as any).options[0]}
                            onChange={(e) => (setting as any).onChange && (setting as any).onChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-krushr-coral-red focus:border-krushr-coral-red"
                          >
                            {(setting as any).options.map((option: string, optionIndex: number) => (
                              <option key={optionIndex} value={option}>
                                {(setting as any).optionLabels ? (setting as any).optionLabels[optionIndex] : option.charAt(0).toUpperCase() + option.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                        {setting.type === 'link' && (
                          <button 
                            onClick={() => (setting as any).action && (setting as any).action()}
                            className="text-krushr-coral-red hover:text-krushr-coral-red/80 font-medium"
                          >
                            Configure
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-lg border border-red-200">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-600 mt-1">These actions are irreversible</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download a copy of all your data</p>
                </div>
                <button 
                  onClick={handleExportData}
                  disabled={exportDataMutation.isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportDataMutation.isLoading ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <FloatingInput
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    label="Name"
                    required
                  />
                </div>
                <div>
                  <FloatingInput
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                    label="Avatar URL (Optional)"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="flex-1 bg-krushr-coral-red text-white py-2 px-4 rounded-lg hover:bg-krushr-coral-red/90 disabled:opacity-50"
                  >
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <div className="relative">
                    <FloatingInput
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      label="Current Password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <FloatingInput
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    label="New Password"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <FloatingInput
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    label="Confirm New Password"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={updatePasswordMutation.isLoading}
                    className="flex-1 bg-krushr-coral-red text-white py-2 px-4 rounded-lg hover:bg-krushr-coral-red/90 disabled:opacity-50"
                  >
                    {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Sessions Modal */}
        {showSessionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {session.isCurrent ? 'Current Session' : 'Session'}
                        </p>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Created: {new Date(session.createdAt).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Expires: {new Date(session.expiresAt).toLocaleString()}</p>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
                {activeSessions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No active sessions found</p>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowSessionsModal(false)}
                  className="bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}