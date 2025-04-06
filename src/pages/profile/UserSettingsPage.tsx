import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DeskLayout } from '../../layouts/DeskLayout'

const UserSettingsPage = () => {
    const navigate = useNavigate()
    
    return (
        <DeskLayout>
            <div className="w-full h-full p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold mb-6">Настройки профиля</h1>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div className="border-b pb-4">
                            <h2 className="text-lg font-medium mb-4">Личная информация</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Имя пользователя"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Email"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-b pb-4">
                            <h2 className="text-lg font-medium mb-4">Безопасность</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Текущий пароль"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Новый пароль"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                                onClick={() => navigate('/desk')}
                            >
                                Отмена
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                Сохранить изменения
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DeskLayout>
    )
}

export default UserSettingsPage 