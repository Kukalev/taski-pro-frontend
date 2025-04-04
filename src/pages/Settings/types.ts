export type SettingsTab = 'profile' | 'appearance' | 'security'

export interface SettingsSectionProps {
  title: string
  children: React.ReactNode
} 