import React from 'react'
import { SettingsSectionProps } from '../types'

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="font-medium mb-4">{title}</h3>
      {children}
    </div>
  )
} 