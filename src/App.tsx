import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NotFound } from './components/NotFound'
import { DeskProvider } from './contexts/DeskContext'
import { DeskLayout } from './layouts/DeskLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { Desk } from './pages/desk/Desk'
import { AllTasks } from './pages/tasks/AllTasks'
import { MyTasks } from './pages/tasks/MyTasks'
import { Team } from './pages/welcome/team/Team'
import { Welcome } from './pages/welcome/Welcome'
import { AuthService } from './services/auth/Auth'

// Простой компонент для защиты роутов
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	if (!AuthService.isAuthenticated()) {
		return <Navigate to='/register' replace />
	}
	return <>{children}</>
}

function App() {
	return (
		<BrowserRouter>
			<DeskProvider>
				<Routes>
					{/* Публичные роуты */}
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />

					{/* Защищенные welcome роуты */}
					<Route
						path='/welcome'
						element={
							<ProtectedRoute>
								<Welcome />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/welcome/team'
						element={
							<ProtectedRoute>
								<Team />
							</ProtectedRoute>
						}
					/>

					{/* Корневой маршрут desk */}
					<Route
						path='/desk'
						element={
							<ProtectedRoute>
								<DeskLayout>
									<Desk />
								</DeskLayout>
							</ProtectedRoute>
						}
					/>

					{/* Допустимые подмаршруты desk */}
					<Route
						path='/desk/myTasks'
						element={
							<ProtectedRoute>
								<DeskLayout>
									<MyTasks />
								</DeskLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path='/desk/allTasks'
						element={
							<ProtectedRoute>
								<DeskLayout>
									<AllTasks />
								</DeskLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path='/desk/allDesks'
						element={
							<ProtectedRoute>
								<Navigate to='/desk' replace />
							</ProtectedRoute>
						}
					/>

					{/* Обработка всех остальных маршрутов desk/* как 404 */}
					<Route
						path='/desk/*'
						element={
							<ProtectedRoute>
								<NotFound />
							</ProtectedRoute>
						}
					/>

					{/* Редирект с главной */}
					<Route path='/' element={AuthService.isAuthenticated() ? <Navigate to='/welcome' replace /> : <Navigate to='/register' replace />} />

					{/* Глобальный 404 для всех остальных маршрутов */}
					<Route path='*' element={<NotFound />} />
				</Routes>
			</DeskProvider>
		</BrowserRouter>
	)
}

export default App
