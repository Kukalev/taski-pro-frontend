import {uploadCurrentUserAvatar} from './api/PutAvatar'
import {getUserAvatarUrl, fetchUserAvatarBlob} from './api/GetCurrentUserAvatar' // Берем функцию для URL
// import { fetchUserAvatarBlob } from './api/GetCurrentUserAvatar'; // Если бы добавили fetch...Blob
import {getAllAvatars} from './api/GetAllAvatars'
// Можно добавить обработчик ошибок по аналогии с DeskService, если нужно
// import { handleAvatarError } from './utils/errorHandlers';

export const AvatarService = {
  // handleError: handleAvatarError, // Если будет обработчик
  uploadCurrentUserAvatar,
  getUserAvatarUrl,
  fetchUserAvatarBlob,
	getAllAvatars,           
};
