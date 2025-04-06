import React from 'react'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {NotFound} from './components/NotFound'
import {DeskProvider} from './contexts/DeskContext'
import {AuthProvider, useAuth} from './contexts/AuthContext'
import {DeskLayout} from './layouts/DeskLayout'
import {LoginPage} from './pages/Auth/LoginPage'
import {RegisterPage} from './pages/Auth/RegisterPage'
import {Desk} from './pages/desk/Desk'
import {DeskDetails} from './pages/desk/deskDetails/DeskDetails.tsx'
import {DeskBoard} from './pages/desk/deskDetails/DeskBoard'
import {DeskOverview} from './pages/desk/deskDetails/DeskOverview'
import {GitHubPage} from './pages/gitHub/GitHubPage'
import {AllTasks} from './pages/tasks/AllTasks'
import {MyTasks} from './pages/tasks/MyTasks'
import {Team} from './pages/welcome/team/Team'
import {Welcome} from './pages/welcome/Welcome'
import {SidebarProvider} from './contexts/SidebarContext'
import {Settings} from './pages/Settings/Settings'
import {
	ProfileSettings
} from './pages/Settings/components/ProfileSettings/ProfileSettings'
import {
	AppearanceSettings
} from './pages/Settings/components/AppearanceSettings/AppearanceSettings'
import {
	SecuritySettings
} from './pages/Settings/components/SecuritySettings/SecuritySettings'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated } = useAuth()
	console.log(`[ProtectedRoute] Проверка авторизации из AuthContext: isAuthenticated = ${isAuthenticated}`);
	if (!isAuthenticated) {
		console.log('[ProtectedRoute] Пользователь НЕ авторизован (AuthContext), редирект на /register');
		return <Navigate to='/register' replace />
	}
	console.log('[ProtectedRoute] Пользователь авторизован (AuthContext), рендеринг дочернего компонента.');
	return <>{children}</>
}

const RootRedirect = () => {
	const { isAuthenticated } = useAuth();
	console.log(`[RootRedirect] Проверка авторизации из AuthContext: isAuthenticated = ${isAuthenticated}`);
	return isAuthenticated ? <Navigate to='/desk' replace /> : <Navigate to='/register' replace />;
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<DeskProvider>
					<SidebarProvider>
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

							{/* Маршруты для конкретной доски по ID */}
							<Route
								path='/desk/:id'
								element={
									<ProtectedRoute>
										<DeskLayout>
											<DeskDetails />
										</DeskLayout>
									</ProtectedRoute>
								}
							>
								<Route path="overview" element={<DeskOverview />} />
								<Route path="board" element={<DeskBoard />} />
								<Route path="github" element={<GitHubPage />} />
								<Route index element={<Navigate to="board" replace />} />
							</Route>

							{/* Специальные подмаршруты desk */}
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

							{/* Редирект с главной теперь через компонент */}
							<Route path='/' element={<RootRedirect />} />

							{/* Маршруты для страницы настроек */}
							<Route
								path='/settings'
								element={
									<ProtectedRoute>
										<Settings />
									</ProtectedRoute>
								}
							>
								<Route path="profile" element={<ProfileSettings />} />
								<Route path="appearance" element={<AppearanceSettings />} />
								<Route path="security" element={<SecuritySettings />} />
								<Route index element={<Navigate to="profile" replace />} />
							</Route>

							{/* Глобальный 404 для всех остальных маршрутов */}
							<Route path='*' element={<NotFound />} />
						</Routes>
					</SidebarProvider>
				</DeskProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App