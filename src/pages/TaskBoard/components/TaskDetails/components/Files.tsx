import React, {useCallback, useEffect, useRef, useState} from 'react'
import {
  FaChevronDown,
  FaDownload,
  FaFileAlt,
  FaPlus,
  FaSpinner,
  FaTrash
} from 'react-icons/fa'
import {FilesService} from '../../../../../services/Files/Files'
import {DeskFile} from '../../../../../services/Files/types' // Используем тип из сервиса
import { DeleteFileModal } from '../../../../../components/modals/DeleteFileModal/DeleteFileModal'

interface TaskFilesProps {
  deskId: number;
  taskId: number;
  canEdit: boolean;
}

// Helper для форматирования размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TaskFiles: React.FC<TaskFilesProps> = ({ deskId, taskId, canEdit }) => {
  const [files, setFiles] = useState<DeskFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояния для модалки удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fileList = await FilesService.getTaskFiles(deskId, [taskId]);
      console.log(`[TaskFiles] Загружен список файлов для задачи ${taskId}:`, fileList);
      setFiles(fileList || []);
    } catch (err) {
      console.error("Ошибка загрузки файлов задачи:", err);
      setError("Не удалось загрузить список файлов.");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [deskId, taskId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    try {
      await FilesService.uploadTaskFile(deskId, taskId, selectedFile);
      await loadFiles();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Неизвестная ошибка';
      setError(`Не удалось загрузить файл "${selectedFile.name}". ${errorMsg}`);
      console.error("Ошибка загрузки файла задачи:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
        await FilesService.deleteTaskFile(deskId, taskId, fileToDelete);
        setFiles(prevFiles => prevFiles.filter(f => f.filename !== fileToDelete));
        console.log(`[TaskFiles] Файл ${fileToDelete} удален из задачи ${taskId}.`);
        handleCloseDeleteModal();
    } catch (err: any) {
        console.error("Ошибка удаления файла задачи:", err);
        throw err;
    } finally {
        setIsDeleting(false);
    }
  };

  const handleDeleteClick = (filename: string) => {
    setFileToDelete(filename);
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  return (
    <>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div
          className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={handleToggleExpand}
        >
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-700">
              Файлы ({isLoading ? '...' : files.length})
            </h3>
            {isLoading && <FaSpinner className="animate-spin text-gray-400" size="0.8em" />}
          </div>
          <div className="flex items-center space-x-4">
            {isExpanded && canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                disabled={isUploading || isDeleting}
                className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center disabled:opacity-50"
              >
                {isUploading ? <FaSpinner className="animate-spin mr-1"/> : <FaPlus className="mr-1" />}
                Прикрепить файл
              </button>
            )}
            <FaChevronDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pl-2 pr-2 space-y-2">
            {error && !isDeleteModalOpen && (
              <div className="text-red-600 text-sm py-2">Ошибка: {error}</div>
            )}
            {!error && files.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 text-sm py-4 border border-dashed rounded">
                Нет прикрепленных файлов
              </div>
            )}
            {files.map((file) => {
               const downloadUrl = FilesService.getDownloadUrl(deskId, file.filename);

               return (
                 <div
                   key={file.id}
                   className="group flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors duration-150"
                 >
                   <div className="flex items-center min-w-0 mr-2">
                     <FaFileAlt className="text-gray-400 mr-3 flex-shrink-0" />
                     <span className="text-sm text-gray-800 truncate" title={file.filename}>
                       {file.filename}
                     </span>
                   </div>
                   <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                     <a
                       href={downloadUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       download={file.filename}
                       className="text-gray-500 hover:text-blue-600"
                       title="Скачать"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <FaDownload />
                     </a>
                     {canEdit && (
                       <button
                         onClick={(e) => { e.stopPropagation(); handleDeleteClick(file.filename); }}
                         className={`text-gray-500 hover:text-red-600 ${(isUploading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                         title="Удалить"
                         disabled={isUploading || isDeleting}
                       >
                         <FaTrash />
                       </button>
                     )}
                   </div>
                 </div>
               );
             })}
             <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               className="hidden"
               disabled={isUploading || isDeleting}
             />
          </div>
        )}
      </div>

      {fileToDelete && (
          <DeleteFileModal
              isOpen={isDeleteModalOpen}
              filename={fileToDelete}
              onClose={handleCloseDeleteModal}
              onConfirm={confirmDeleteFile}
              isLoading={isDeleting}
          />
      )}
    </>
  );
};
