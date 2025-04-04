import { ProfileFormProps } from '../types'
import { useState } from 'react'

export const ProfileForm: React.FC<ProfileFormProps> = ({ username, email }) => {
  const [firstName, setFirstName] = useState('ASdasd')
  const [lastName, setLastName] = useState('asdasdas')
  const [bio, setBio] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Сохранено:', { firstName, lastName, bio })
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
        <input
          id="firstName"
          type="text"
          className="p-2 border border-gray-300 rounded-md w-full max-w-sm"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
        <input
          id="lastName"
          type="text"
          className="p-2 border border-gray-300 rounded-md w-full max-w-sm"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Обо мне</label>
        <textarea
          id="bio"
          className="p-2 border border-gray-300 rounded-md w-full max-w-sm"
          rows={4}
          placeholder="Введите описание"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Страна</label>
        <div className="relative w-full max-w-sm">
          <select
            id="country"
            className="p-2 border border-gray-300 rounded-md w-full pr-8 appearance-none bg-white"
            defaultValue="ru"
          >
            <option value="ru">🇷🇺 Российская Федерация</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between">
          <div className="w-1/2 pr-2">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
            <div className="relative w-full">
              <select
                id="timezone"
                className="p-2 border border-gray-300 rounded-md w-full pr-8 appearance-none bg-white"
                defaultValue="msk"
              >
                <option value="msk">Europe/Moscow (UTC+03:00)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="w-1/2 pl-2">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Язык</label>
            <div className="relative w-full">
              <select
                id="language"
                className="p-2 border border-gray-300 rounded-md w-full pr-8 appearance-none bg-white"
                defaultValue="ru"
              >
                <option value="ru">RU</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
        <div className="relative w-full max-w-sm">
          <input
            id="email"
            type="email"
            className="p-2 border border-gray-300 rounded-md w-full pr-10"
            value={email}
            disabled
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Сохранить
        </button>
      </div>
    </form>
  )
} 