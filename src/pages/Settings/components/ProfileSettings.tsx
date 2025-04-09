import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Profile, UpdateProfileData } from '../../../services/User/types';
import UserSettingsService from '../../../services/User/User';
import AvatarService from '../../../services/Avatar/Avatar';
import { SettingsSection } from './SettingsSection';
import { ProfileForm } from './ProfileForm';
import { EmailChangeModal } from './EmailChangeModal';
import { UserAvatar } from './UserAvatar';
import api from '../../../services/api';
import { getUserAvatarUrl, fetchUserAvatarBlob } from '../../../services/Avatar/api/GetCurrentUserAvatar';

export const ProfileSettings: React.FC = () => {
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadAndSetAvatar = useCallback(async (username: string) => {
        console.log(`[ProfileSettings] Загрузка и установка аватара для ${username}...`);
        setAvatarLoading(true);
        setAvatarError(null);
        try {
            const blob = await fetchUserAvatarBlob(username);
            if (blob) {
                const currentObjectUrl = avatarObjectUrl;
                const newObjectUrl = URL.createObjectURL(blob);
                console.log(`[ProfileSettings] Создан новый Object URL: ${newObjectUrl}`);
                setAvatarObjectUrl(prevUrl => {
                    if (prevUrl && prevUrl !== newObjectUrl) {
                        console.log(`[ProfileSettings] Отзыв старого Object URL: ${prevUrl}`);
                        URL.revokeObjectURL(prevUrl);
                    }
                    return newObjectUrl;
                });
            } else {
                setAvatarObjectUrl(prevUrl => {
                     if (prevUrl) {
                         console.log(`[ProfileSettings] Отзыв старого Object URL (аватар не найден): ${prevUrl}`);
                         URL.revokeObjectURL(prevUrl);
                     }
                     return null;
                });
            }
        } catch (err: any) {
            console.error('[ProfileSettings] Ошибка при загрузке Blob аватара:', err);
            setAvatarError(err.message || 'Не удалось загрузить аватар.');
             setAvatarObjectUrl(prevUrl => {
                 if (prevUrl) {
                     console.log(`[ProfileSettings] Отзыв старого Object URL (ошибка загрузки): ${prevUrl}`);
                     URL.revokeObjectURL(prevUrl);
                 }
                 return null;
             });
        } finally {
            setAvatarLoading(false);
        }
    }, [avatarObjectUrl]);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            console.log('[ProfileSettings] Загрузка профиля...');
            try {
                const profile = await UserSettingsService.getCurrentUser();
                console.log('[ProfileSettings] Профиль загружен:', profile);
                setUserProfile(profile);
                if (profile?.username) {
                   await loadAndSetAvatar(profile.username);
                }
            } catch (err: any) {
                console.error('[ProfileSettings] Ошибка загрузки профиля:', err);
                setError(err.message || 'Не удалось загрузить профиль.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            if (avatarObjectUrl) {
                console.log(`[ProfileSettings Cleanup] Отзыв Object URL: ${avatarObjectUrl}`);
                URL.revokeObjectURL(avatarObjectUrl);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleProfileUpdate = async (data: UpdateProfileData) => {
        // ... (логика обновления профиля как была)
    };

    const handleOpenEmailModal = () => setIsEmailModalOpen(true);
    const handleCloseEmailModal = () => setIsEmailModalOpen(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && userProfile) {
            console.log(`[ProfileSettings] Выбран файл: ${file.name}, тип: ${file.type}`);
            setAvatarLoading(true);
            setAvatarError(null);
            try {
                console.log('[ProfileSettings] Загрузка нового аватара через AvatarService...');
                await AvatarService.uploadCurrentUserAvatar(file);
                console.log('[ProfileSettings] Новый аватар УСПЕШНО загружен на сервер.');
                await loadAndSetAvatar(userProfile.username);
                console.log('[ProfileSettings] Blob нового аватара загружен и Object URL обновлен.');

            } catch (err: any) {
                console.error('[ProfileSettings] Ошибка при загрузке нового аватара:', err);
                setAvatarError(err.message || 'Не удалось загрузить аватар.');
            } finally {
               if(event.target) {
                    event.target.value = '';
               }
            }
        } else {
             console.log('[ProfileSettings] Файл не выбран или профиль не загружен.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!userProfile) return <Alert severity="warning">Профиль пользователя не найден.</Alert>;

    console.log(`[ProfileSettings] Rendering. isEmailModalOpen: ${isEmailModalOpen} userProfile.email: ${userProfile.email}`);

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
            <SettingsSection title="Аватар пользователя">
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
                    {avatarLoading && (
                       <CircularProgress
                           size={80}
                           sx={{
                               position: 'absolute',
                               top: 0,
                               left: '50%',
                               marginLeft: '-40px',
                               zIndex: 1,
                           }}
                       />
                    )}
                    <UserAvatar
                        username={userProfile.username}
                        size="lg"
                        avatarUrl={avatarObjectUrl}
                        isEditable={true}
                        onClick={handleAvatarClick}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </Box>
                 {avatarError && <Alert severity="error" sx={{ mt: 1 }}>{avatarError}</Alert>}
            </SettingsSection>

            <SettingsSection title="Данные профиля">
                <ProfileForm
                    initialData={userProfile}
                    onSubmit={handleProfileUpdate}
                    onEmailChangeClick={handleOpenEmailModal}
                />
            </SettingsSection>

            {isEmailModalOpen && (
                <EmailChangeModal
                    open={isEmailModalOpen}
                    onClose={handleCloseEmailModal}
                    currentEmail={userProfile.email}
                />
            )}
        </Box>
    );
}; 