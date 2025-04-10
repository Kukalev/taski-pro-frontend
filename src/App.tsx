import {BrowserRouter, Navigate, Outlet, Route, Routes} from 'react-router-dom'
import {NotFound} from './components/NotFound'
import {DeskProvider} from './contexts/DeskContext'
import {AuthProvider, useAuth} from './contexts/AuthContext'
import {DeskLayout} from './layouts/DeskLayout'
import {LoginPage} from './pages/Auth/LoginPage'
import {RegisterPage} from './pages/Auth/RegisterPage'
import {ForgotPasswordPage} from './pages/Auth/ForgotPasswordPage'
import {Desk} from './pages/desk/Desk'
import {DeskDetails} from './pages/desk/deskDetails/DeskDetails'
import {DeskBoard} from './pages/desk/deskDetails/DeskBoard'
import {DeskOverview} from './pages/desk/deskDetails/DeskOverview'
import {GitHubPage} from './pages/gitHub/GitHubPage'
import {FilesPage} from './pages/Files/FilesPage'
import {AllTasks} from './pages/tasks/AllTasks'
import {MyTasks} from './pages/tasks/MyTasks/MyTasks.tsx'

import {SidebarProvider} from './contexts/SidebarContext'
import {SettingsLayout} from './layouts/SettingsLayout'
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

import {
	Subscriptions
} from './pages/Settings/components/Subscriptions/Subscriptions'

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
};

const RootRedirect = () => {
	const { isAuthenticated, isLoadingAuth } = useAuth()
	console.log(`[RootRedirect] Проверка авторизации из AuthContext: isAuthenticated = ${isAuthenticated}, isLoadingAuth = ${isLoadingAuth}`)

	if (isLoadingAuth) {
		console.log('[RootRedirect] Ожидание завершения проверки AuthContext...')
		return null;
	}

	return isAuthenticated ? <Navigate to='/desk' replace /> : <Navigate to='/register' replace />
};

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<DeskProvider>
					<SidebarProvider>
						<Routes>
							<Route path='/login' element={<LoginPage />} />
							<Route path='/register' element={<RegisterPage />} />
							<Route path='/forgot-password' element={<ForgotPasswordPage />} />

							<Route element={<ProtectedRoute redirectPath="/login" />}>

								<Route
									path='/desk'
									element={
										<DeskLayout>
											<Desk />
										</DeskLayout>
									}
								/>
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
									<Route path="files" element={<FilesPage />} />
									<Route index element={<Navigate to="overview" replace />} />
								</Route>
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

								<Route
									path='/settings'
									element={
										<SettingsLayout>
											<Settings />
										</SettingsLayout>
									}
								>
									<Route path="profile" element={<ProfileSettings />} />
									<Route path="appearance" element={<AppearanceSettings />} />
									<Route path="security" element={<SecuritySettings />} />
									<Route path="subscriptions" element={<Subscriptions />} />
									<Route index element={<Navigate to="profile" replace />} />
								</Route>


							</Route>

							<Route path='/' element={<RootRedirect />} />

							<Route path='*' element={<NotFound />} />
						</Routes>
					</SidebarProvider>
				</DeskProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App;