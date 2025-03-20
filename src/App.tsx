import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import './App.css'
import {LoginPage} from './pages/Auth/LoginPage'
import {RegisterPage} from './pages/Auth/RegisterPage'
import { Home } from './pages/Home'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/register' element={<RegisterPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/' element={<Navigate to='/register' />} />
        <Route path="/home" element={<Home />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
