import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NotFound } from './components/NotFound'
import { DeskProvider } from './contexts/DeskContext'
import { DeskLayout } from './layouts/DeskLayout'
import { LoginPage } from './pages/Auth/LoginPage'
import { RegisterPage } from './pages/Auth/RegisterPage'
import { Desk } from './pages/desk/Desk'
import { DeskDetails } from './pages/desk/DeskDetails'
import { DeskOverview } from './pages/desk/deskDetails/DeskOverview'
import { DeskBoard } from './pages/desk/deskDetails/DeskBoard'
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
							<DeskProvider>
								<DeskLayout>
									<Desk />
								</DeskLayout>
							</DeskProvider>
						</ProtectedRoute>
					}
				/>

				{/* Маршруты для конкретной доски по ID */}
				<Route
					path='/desk/:id'
					element={
						<ProtectedRoute>
							<DeskProvider>
								<DeskLayout>
									<DeskDetails />
								</DeskLayout>
							</DeskProvider>
						</ProtectedRoute>
					}
				>
					<Route path="overview" element={<DeskOverview />} />
					<Route path="board" element={<DeskBoard />} />
					<Route index element={<Navigate to="board" replace />} />
				</Route>

				{/* Специальные подмаршруты desk */}
				<Route
					path='/desk/myTasks'
					element={
						<ProtectedRoute>
							<DeskProvider>
								<DeskLayout>
									<MyTasks />
								</DeskLayout>
							</DeskProvider>
						</ProtectedRoute>
					}
				/>
				<Route
					path='/desk/allTasks'
					element={
						<ProtectedRoute>
							<DeskProvider>
								<DeskLayout>
									<AllTasks />
								</DeskLayout>
							</DeskProvider>
						</ProtectedRoute>
					}
				/>

				{/* Редирект с главной */}
				<Route path='/' element={AuthService.isAuthenticated() ? <Navigate to='/welcome' replace /> : <Navigate to='/register' replace />} />

				{/* Глобальный 404 для всех остальных маршрутов */}
				<Route path='*' element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
