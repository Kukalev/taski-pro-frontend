import React from 'react'
import {BrowserRouter, Navigate, Route, Routes, Outlet} from 'react-router-dom'
import {NotFound} from './components/NotFound'
import {DeskProvider} from './contexts/DeskContext'
import {AuthProvider, useAuth} from './contexts/AuthContext'
import {DeskLayout} from './layouts/DeskLayout'
import {LoginPage} from './pages/Auth/LoginPage'
import {RegisterPage} from './pages/Auth/RegisterPage'
import {ForgotPasswordPage} from './pages/Auth/ForgotPasswordPage'
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
import { SettingsLayout } from './layouts/SettingsLayout' 
import { Settings } from './pages/Settings/Settings'
import {
	ProfileSettings
} from './pages/Settings/components/ProfileSettings/ProfileSettings'
import {
	AppearanceSettings
} from './pages/Settings/components/AppearanceSettings/AppearanceSettings'
import {
	SecuritySettings
} from './pages/Settings/components/SecuritySettings/SecuritySettings'
import { SubscriptionsPage } from './pages/Subscriptions/SubscriptionsPage'

const ProtectedRoute = ({ redirectPath = '/register' }: { redirectPath?: string }) => {
	const { isAuthenticated, isLoadingAuth } = useAuth()

	if (isLoadingAuth) {
		console.log('[ProtectedRoute] Ожидание завершения проверки AuthContext (isLoadingAuth)...')
		return null;
	}

	if (!isAuthenticated) {
		console.log(`[ProtectedRoute] Пользователь НЕ авторизован (isLoadingAuth=${isLoadingAuth}), редирект на ${redirectPath}`)
		return <Navigate to={redirectPath} replace />
	}

	console.log(`[ProtectedRoute] Пользователь авторизован (isLoadingAuth=${isLoadingAuth}), рендеринг дочернего компонента (Outlet).`)
	return <Outlet />
}

const RootRedirect = () => {
	const { isAuthenticated, isLoadingAuth } = useAuth()
	console.log(`[RootRedirect] Проверка авторизации из AuthContext: isAuthenticated = ${isAuthenticated}, isLoadingAuth = ${isLoadingAuth}`)
	
	if (isLoadingAuth) {
		console.log('[RootRedirect] Ожидание завершения проверки AuthContext...')
		return null;
	}

	return isAuthenticated ? <Navigate to='/desk' replace /> : <Navigate to='/register' replace />
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
							<Route path='/forgot-password' element={<ForgotPasswordPage />} />

							{/* Обертка для защищенных роутов */}
							<Route element={<ProtectedRoute redirectPath="/register" />}>
								{/* Welcome роуты */}
								<Route path='/welcome' element={<Welcome />} />
								<Route path='/welcome/team' element={<Team />} />

								{/* Корневой маршрут desk */}
								<Route
									path='/desk'
									element={
										<DeskLayout>
											<Desk />
										</DeskLayout>
									}
								/>

								{/* Маршруты для конкретной доски по ID */}
								<Route
									path='/desk/:id'
									element={
										<DeskLayout>
											<DeskDetails />
										</DeskLayout>
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
										<DeskLayout>
											<MyTasks />
										</DeskLayout>
									}
								/>
								<Route
									path='/desk/allTasks'
									element={
										<DeskLayout>
											<AllTasks />
										</DeskLayout>
									}
								/>
								
								{/* --- Обновленные Маршруты для страницы настроек --- */}
								<Route
									path='/settings' // Базовый путь
									element={
										// Используем SettingsLayout для всех /settings/*
										<SettingsLayout> 
											{/* Компонент Settings просто рендерит Outlet для вложенных роутов */}
											<Settings /> 
										</SettingsLayout>
									}
								>
									{/* Вложенные роуты для конкретных вкладок */}
									<Route path="profile" element={<ProfileSettings />} />
									<Route path="appearance" element={<AppearanceSettings />} />
									<Route path="security" element={<SecuritySettings />} />
									{/* Редирект по умолчанию для /settings */}
									<Route index element={<Navigate to="profile" replace />} /> 
								</Route>
								{/* --- Конец маршрутов настроек --- */}

								{/* Маршруты для страницы подписок */}
								<Route
									path='/subscriptions'
									element={
										<DeskLayout>
											<SubscriptionsPage />
										</DeskLayout>
									}
								/>
							</Route>

							{/* Редирект с главной теперь через компонент */}
							<Route path='/' element={<RootRedirect />} />

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