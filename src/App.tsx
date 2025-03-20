import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import './App.css'
import {LoginPage} from './pages/auth/LoginPage'
import {RegisterPage} from './pages/auth/RegisterPage'
import {Home} from './pages/Home'
import {Team} from './pages/welcome/Team'
import {Welcome} from './pages/welcome/Welcome'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/register' element={<RegisterPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/' element={<Navigate to='/register' />} />
				<Route path='/home' element={<Home />} />
				<Route path='/welcome' element={<Welcome />} />
				<Route path='/welcome/team' element={<Team />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
