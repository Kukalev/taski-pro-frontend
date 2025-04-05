import {ProfileFormProps} from '../types'
import {useState, useEffect} from 'react'

export const ProfileForm: React.FC<ProfileFormProps> = ({ username, email }) => {
  const initialFirstName = 'ASdasd'
  const initialLastName = 'asdasdas'

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [bio, setBio] = useState('')
  
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const hasChanged = firstName !== initialFirstName || lastName !== initialLastName
    setIsDirty(hasChanged)
  }, [firstName, lastName, initialFirstName, initialLastName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDirty) return
    console.log('Сохранено:', { firstName, lastName, bio })
  }
  
  const inputStyle = "p-2 bg-gray-50 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-300 border border-gray-200 placeholder-gray-400"
  const disabledInputStyle = "p-2 bg-gray-100 rounded-lg w-full pr-10 border border-gray-200 text-gray-700 cursor-not-allowed"

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
        <input
          id="firstName"
          type="text"
          className={inputStyle}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
        <input
          id="lastName"
          type="text"
          className={inputStyle}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
        <div className="relative w-full">
          <input
            id="email"
            type="email"
            className={disabledInputStyle}
            value={email}
            disabled
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className={`px-6 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ 
            isDirty 
            ? 'bg-[var(--theme-color)] text-white hover:bg-[var(--theme-color-dark)] focus:ring-[var(--theme-color)] cursor-pointer' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          }`}
          disabled={!isDirty}
        >
          Сохранить
        </button>
      </div>
    </form>
  )
} 