import { Header } from '../components/header/Header'
import { SettingsSidebar } from '../components/sidebar/SettingsSidebar'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <SettingsSidebar />
        <main className='flex-1 overflow-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  )
} 