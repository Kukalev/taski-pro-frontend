import { createContext, ReactNode, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AuthService } from '../services/auth/Auth'
import { DeskService } from '../services/desk/Desk'

// Интерфейс для доски
export interface DeskData {
	id: number
	deskName: string
	deskDescription?: string
	deskCreateDate: Date | string
	deskFinishDate: Date | string | null
	userLimit?: number
	status?: string
	username?: string
}

// Интерфейс контекста - добавляем setDesks
interface DeskContextType {
	desks: DeskData[]
	loading: boolean
	error: string | null
	loadDesks: () => Promise<void>
	addDesk: (desk: DeskData) => void
	removeDesk: (id: number) => void
	setDesks: React.Dispatch<React.SetStateAction<DeskData[]>>
	updateDesk: (updatedDeskData: DeskData) => void
}

const DeskContext = createContext<DeskContextType | undefined>(undefined)

export function DeskProvider({ children }: { children: ReactNode }) {
	const [desks, setDesks] = useState<DeskData[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const loadDesks = useCallback(async () => {
		if (!AuthService.isAuthenticated()) {
			console.log('Пользователь не авторизован, пропускаем загрузку досок')
			setDesks([])
			return
		}
		console.log('[DeskContext] Загрузка досок...')
		try {
			setLoading(true)
			setError(null)
			const data = await DeskService.getAllDesks()
			console.log('[DeskContext] Доски успешно загружены:', data)
			setDesks(data)
		} catch (error: any) {
			console.error('[DeskContext] Ошибка при загрузке досок:', error)
			setError('Не удалось загрузить доски')
		} finally {
			setLoading(false)
		}
	}, [])

	const addDesk = useCallback((desk: DeskData) => {
		console.log('[DeskContext] Добавление доски:', desk)
		setDesks(prev => [...prev, desk])
	}, [])
	
	const removeDesk = useCallback((id: number) => {
		console.log(`[DeskContext] Удаление доски ID: ${id}`)
		setDesks(prev => prev.filter(desk => desk.id !== id))
	}, [])
	
	// Обновляем одну доску ИММУТАБЕЛЬНО
	const updateDesk = useCallback((updatedDeskData: DeskData) => {
		console.log(`[DeskContext] Обновление доски ID: ${updatedDeskData.id}`, updatedDeskData)
		setDesks(prevDesks => 
			prevDesks.map(desk => 
				desk.id === updatedDeskData.id ? { ...desk, ...updatedDeskData } : desk
			)
		)
	}, [])

	useEffect(() => {
		loadDesks()
	}, [loadDesks])

	const contextValue = useMemo(() => ({ 
		desks, 
		loading, 
		error, 
		loadDesks, 
		addDesk, 
		removeDesk, 
		setDesks,
		updateDesk 
	}), [desks, loading, error, loadDesks, addDesk, removeDesk, updateDesk])

	return (
		<DeskContext.Provider value={contextValue}>
			{children}
		</DeskContext.Provider>
	)
}

// Хук для использования контекста
export function useDesks() {
	const context = useContext(DeskContext)
	if (context === undefined) {
		throw new Error('useDesks must be used within a DeskProvider')
	}
	return context
}
