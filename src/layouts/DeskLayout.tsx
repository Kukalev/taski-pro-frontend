import { Header } from '../components/header/Header'
import { Sidebar } from '../components/sidebar/Sidebar'
import { useSidebar } from '../contexts/SidebarContext'

interface DeskLayoutProps {
	children: React.ReactNode
}

export const DeskLayout = ({ children }: DeskLayoutProps) => {
	const { isCollapsed } = useSidebar()
	
	return (
		<div className='flex flex-col min-h-screen bg-white'>
			<Header />
			<div className='flex flex-1 overflow-hidden'>
				<Sidebar />
				<main className='flex-1 overflow-auto'>
					{children}
				</main>
			</div>
		</div>
	)
}
