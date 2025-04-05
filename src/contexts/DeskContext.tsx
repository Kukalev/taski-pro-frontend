import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useRef
} from 'react'
import {DeskService} from '../services/desk/Desk'
import {useAuth} from './AuthContext'

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
	const { isAuthenticated } = useAuth()
	const loadingRef = useRef(false)
	const initialLoadDoneRef = useRef(false)

	const loadDesks = useCallback(async () => {
		if (!isAuthenticated) {
			console.log('[DeskContext] loadDesks: Пользователь не авторизован (AuthContext), пропускаем.')
			return
		}
		if (loadingRef.current) {
			console.log('[DeskContext] loadDesks: Загрузка уже идет, пропускаем.')
			return;
		}
		console.log('[DeskContext] loadDesks: Пользователь авторизован (AuthContext). НАЧАЛО ЗАГРУЗКИ досок...')
		try {
			setLoading(true)
			loadingRef.current = true
			setError(null)
			console.log('[DeskContext] loadDesks: Вызов DeskService.getAllDesks()...');
			const data = await DeskService.getAllDesks()
			console.log(`[DeskContext] loadDesks: DeskService.getAllDesks() УСПЕШНО вернул ${data.length} досок.`);
			setDesks(data)
			initialLoadDoneRef.current = true
		} catch (error: any) {
			console.error('[DeskContext] loadDesks: ОШИБКА при вызове DeskService.getAllDesks():', error)
			setError('Не удалось загрузить доски')
			setDesks([])
		} finally {
			setLoading(false)
			loadingRef.current = false
			console.log('[DeskContext] loadDesks: ЗАВЕРШЕНИЕ операции загрузки (finally).')
		}
	}, [isAuthenticated])

	// Используем useRef для отслеживания предыдущего состояния isAuthenticated
	const prevIsAuthenticatedRef = useRef(isAuthenticated)

	// useEffect для отслеживания изменений isAuthenticated
	useEffect(() => {
		// Проверяем, изменилось ли состояние аутентификации
		if (isAuthenticated !== prevIsAuthenticatedRef.current) {
			console.log('[DeskContext] useEffect[isAuthenticated]: isAuthenticated изменился на', isAuthenticated);
			
			if (isAuthenticated) {
				console.log('[DeskContext] useEffect[isAuthenticated]: isAuthenticated стало true.');
				console.log('[DeskContext] useEffect[isAuthenticated]: Вызов loadDesks...');
				loadDesks();
			} else {
				console.log('[DeskContext] useEffect[isAuthenticated]: isAuthenticated стало false, очищаем доски.')
				setDesks([]);
			}
			
			// Обновляем предыдущее значение
			prevIsAuthenticatedRef.current = isAuthenticated;
		}
	}, [isAuthenticated, loadDesks]);

	// Дополнительный useEffect для загрузки досок при монтировании компонента
	useEffect(() => {
		if (isAuthenticated && !initialLoadDoneRef.current) {
			console.log('[DeskContext] useEffect[mount]: Первичная загрузка досок при монтировании...');
			loadDesks();
		}
	}, [loadDesks, isAuthenticated]);

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
