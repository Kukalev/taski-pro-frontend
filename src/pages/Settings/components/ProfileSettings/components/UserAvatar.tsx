import { UserAvatarProps } from '../types'

export const UserAvatar: React.FC<UserAvatarProps> = ({ username, size = 'lg' }) => {
  const getSize = () => {
    switch(size) {
      case 'sm': return 'w-10 h-10 text-base'
      case 'lg': return 'w-16 h-16 text-xl'
      default: return 'w-12 h-12 text-lg'
    }
  }
  
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }
  
  return (
    <div className={`${getSize()} rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center`}>
      {getInitials(username)}
    </div>
  )
} 