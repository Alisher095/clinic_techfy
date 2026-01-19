import React, { useState } from 'react'
import { useAuthStore, useAppStore } from '../store'
import { Settings as SettingsIcon, Bell, Lock, User } from 'lucide-react'

function Settings() {
  const user = useAuthStore(state => state.user)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    alertThreshold: 'medium',
    dailyReport: true,
    expiredInsuranceAlert: true,
    highDeductibleAlert: true,
    autoReverify: false,
  })
  
  const [saved, setSaved] = useState(false)
  
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }
  
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account and notification preferences</p>
      </div>
      
      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">Settings saved successfully!</p>
        </div>
      )}
      
      {/* Account Settings */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <User size={24} />
          Account Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="input-field opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Clinic
            </label>
            <input
              type="text"
              value={user?.clinic || ''}
              disabled
              className="input-field opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="input-field opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Bell size={24} />
          Notification Preferences
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive alerts via email</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Browser push notifications</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Daily Report</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Receive daily summary report</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailyReport}
                onChange={(e) => handleChange('dailyReport', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">Alert Notification Threshold</p>
          <select
            value={settings.alertThreshold}
            onChange={(e) => handleChange('alertThreshold', e.target.value)}
            className="input-field"
          >
            <option value="high">High Severity Only</option>
            <option value="medium">Medium & High</option>
            <option value="low">All Alerts</option>
          </select>
        </div>
      </div>
      
      {/* Alert Rules */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <SettingsIcon size={24} />
          Alert Rules
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Expired Insurance Alert</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Alert when insurance is expired</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.expiredInsuranceAlert}
                onChange={(e) => handleChange('expiredInsuranceAlert', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">High Deductible Alert</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Alert for high deductible remaining</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highDeductibleAlert}
                onChange={(e) => handleChange('highDeductibleAlert', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Auto Re-verify</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically re-verify insurance within 24h</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoReverify}
                onChange={(e) => handleChange('autoReverify', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Security */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Lock size={24} />
          Security
        </h2>
        
        <button className="btn btn-secondary w-full">
          Change Password
        </button>
      </div>
      
      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="btn btn-primary flex-1"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
