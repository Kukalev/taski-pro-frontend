import { Header } from '../components/header/Header'
import { Sidebar } from '../components/sidebar/Sidebar'

interface DeskLayoutProps {
	children: React.ReactNode
}

export const DeskLayout = ({ children }: DeskLayoutProps) => {
	return (
		<div className='flex flex-col min-h-screen bg-white'>
			<Header />
			<div className='flex flex-1 overflow-hidden'>
				<Sidebar />
				{children}
			</div>
		</div>
	)
}
