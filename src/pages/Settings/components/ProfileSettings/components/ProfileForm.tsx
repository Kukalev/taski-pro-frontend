import {ProfileFormProps} from '../types'
import {useEffect, useState} from 'react'
import {
  UserSettingsService
} from '../../../../../services/userSettings/UserSettings'
import {UserProfile} from '../../../../../services/userSettings/types'

export const ProfileForm: React.FC<ProfileFormProps> = ({userProfile, onUpdateSuccess, onEmailChangeClick}) => {
  const initialUsername = userProfile?.username || ''
  const initialFirstName = userProfile?.firstname || ''
  const initialLastName = userProfile?.lastname || ''
  const initialEmail = userProfile?.email || ''

  const [username, setUsername] = useState(initialUsername)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)

  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setUsername(userProfile?.username || '')
    setFirstName(userProfile?.firstname || '')
    setLastName(userProfile?.lastname || '')
    setIsDirty(false)
    setError('')
    setSuccess('')
  }, [userProfile])

  useEffect(() => {
    const hasChanged =
      username !== initialUsername ||
      firstName !== initialFirstName ||
      lastName !== initialLastName
    setIsDirty(hasChanged)
    if (hasChanged) {
      setError('')
      setSuccess('')
    }
  }, [username, firstName, lastName, initialUsername, initialFirstName, initialLastName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDirty || isLoading) return

    setError('')
    setSuccess('')
    setIsLoading(true)

    const updateData: Partial<UserProfile> = {}
    if (username !== initialUsername) updateData.username = username
    if (firstName !== initialFirstName) updateData.firstname = firstName
    if (lastName !== initialLastName) updateData.lastname = lastName

    try {
      console.log('Сохранение изменений профиля:', updateData)
      const updatedProfile = await UserSettingsService.updateUser(updateData)
      setSuccess('Профиль успешно обновлен!')
      setIsDirty(false)
      if (onUpdateSuccess && updatedProfile) {
        onUpdateSuccess(updatedProfile as UserProfile)
      } else if (onUpdateSuccess) {
        onUpdateSuccess()
      }
    } catch (err: any) {
      console.error("Ошибка при обновлении профиля:", err)
      setError(err.message || 'Не удалось обновить профиль.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const inputStyle = "p-2 bg-gray-50 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-300 border border-gray-200 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
  const disabledInputStyle = "p-2 bg-gray-100 rounded-lg w-full border border-gray-200 text-gray-700 cursor-pointer"

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя (логин)</label>
        <input
          id="username"
          type="text"
          className={inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
        <input
          id="firstName"
          type="text"
          className={inputStyle}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
        <div
            className="relative flex-grow cursor-pointer group"
            style={{ zIndex: 10 }}
            onClick={() => {
                console.log('[ProfileForm] Email field wrapper clicked. isLoading:', isLoading);
                if (!isLoading) {
                    console.log('[ProfileForm] Calling onEmailChangeClick...');
                    onEmailChangeClick();
                } else {
                     console.log('[ProfileForm] Click ignored because isLoading is true.');
                }
            }}
            title="Нажмите, чтобы изменить email"
        >
          <input
            id="email"
            type="email"
            className={`${disabledInputStyle} group-hover:bg-gray-200 transition-colors duration-150`}
            value={userProfile?.email || ''}
            disabled
            readOnly
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
      
      {error && (
        <div className="my-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="my-4 p-2 bg-green-50 text-green-600 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className={`px-6 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDirty && !isLoading
              ? 'bg-[var(--theme-color)] text-white hover:bg-[var(--theme-color-dark)] focus:ring-[var(--theme-color)] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isDirty || isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
} 