import React from 'react';
import { UserAvatarProps } from '../types'
import { FaPencilAlt } from 'react-icons/fa';

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  size = 'lg',
  isEditable = false,
  onClick,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-10 h-10 text-base'
      case 'lg': return 'w-16 h-16 text-xl'
      default: return 'w-12 h-12 text-lg'
    }
  }
  
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }
  
  const baseClasses = `${getSizeClasses()} rounded-full flex items-center justify-center overflow-hidden`
  const containerClasses = `relative group ${isEditable ? 'cursor-pointer' : ''}`

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[UserAvatar] Ошибка загрузки изображения по URL:', avatarUrl, e);
    setImgError(true);
  };

  return (
    <div
      className={containerClasses}
      onClick={isEditable ? onClick : undefined}
      title={isEditable ? "Нажмите, чтобы изменить аватар" : undefined}
    >
      {imgError || !avatarUrl ? (
        <div className={`${baseClasses} bg-gradient-to-r from-pink-500 to-red-500 text-white`}>
          {getInitials(username)}
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt={`Аватар ${username}`}
          className={`${baseClasses} object-cover`}
          onError={handleImageError}
        />
      )}

      {isEditable && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FaPencilAlt className="text-white text-lg" />
        </div>
      )}
    </div>
  )
} 