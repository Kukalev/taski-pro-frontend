import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import {DeskLayout} from './layouts/DeskLayout'
import {LoginPage} from './pages/auth/LoginPage'
import {RegisterPage} from './pages/auth/RegisterPage'
import {AllDesks} from './pages/tasks/AllDesks'
import {Desk} from './pages/desk/Desk'
import {AllTasks} from './pages/tasks/AllTasks'
import {MyTasks} from './pages/tasks/MyTasks'
import {Team} from './pages/welcome/Team'
import {Welcome} from './pages/welcome/Welcome'
import {AuthService} from './services/auth/Auth'

// Простой компонент для защиты роутов
const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
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

				{/* Защищенные desk роуты */}
				<Route
					path='/desk/*'
					element={
						<ProtectedRoute>
							<DeskLayout>
								<Routes>
									<Route index element={<Desk />} />
									<Route path='mytasks' element={<MyTasks />} />
									<Route path='alltasks' element={<AllTasks />} />
									<Route path='alldesks' element={<AllDesks />} />
								</Routes>
							</DeskLayout>
						</ProtectedRoute>
					}
				/>

				{/* Редирект с главной */}
				<Route
					path='/'
					element={
						AuthService.isAuthenticated() ? <Navigate to='/welcome' replace /> : <Navigate to='/register' replace />
					}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default App
