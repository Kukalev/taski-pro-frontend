import { Header } from '../components/header/Header'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        {children}
      </div>
    </div>
  )
} 