import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { AuthService } from '../services/auth/Auth'
import { DeskService } from '../services/desk/Desk'

// Интерфейс для доски
interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}

// Интерфейс контекста
interface DeskContextType {
	desks: DeskData[]
	loading: boolean
	error: string | null
	loadDesks: () => Promise<void>
	addDesk: (desk: DeskData) => void
}

const DeskContext = createContext<DeskContextType | undefined>(undefined)

export function DeskProvider({ children }: { children: ReactNode }) {
	const [desks, setDesks] = useState<DeskData[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const loadDesks = async () => {
		if (!AuthService.isAuthenticated()) {
			console.log('Пользователь не авторизован, пропускаем загрузку досок')
			return
		}

		try {
			setLoading(true)
			setError(null)
			const data = await DeskService.getAllDesks()
			setDesks(data)
		} catch (error: any) {
			console.error('Ошибка при загрузке досок:', error)
			setError('Не удалось загрузить доски')
		} finally {
			setLoading(false)
		}
	}

	const addDesk = (desk: DeskData) => {
		setDesks(prev => [...prev, desk])
	}

	// Загружаем доски при первом рендере, но только если пользователь авторизован
	useEffect(() => {
		if (AuthService.isAuthenticated()) {
			loadDesks()
		}
	}, [])

	return <DeskContext.Provider value={{ desks, loading, error, loadDesks, addDesk }}>{children}</DeskContext.Provider>
}

// Хук для использования контекста
export function useDesks() {
	const context = useContext(DeskContext)
	if (context === undefined) {
		throw new Error('useDesks must be used within a DeskProvider')
	}
	return context
}
