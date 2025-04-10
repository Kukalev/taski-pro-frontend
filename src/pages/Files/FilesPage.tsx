import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext, useParams} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {
    FaDownload,
    FaExclamationTriangle,
    FaFileAlt,
    FaSpinner,
    FaTrash,
    FaUpload
} from 'react-icons/fa'
import {DeskFile, FilesService} from '../../services/Files/Files'
import {DeskOutletContext} from './types'
import {
    DeleteFileModal
} from '../../components/modals/DeleteFileModal/DeleteFileModal'

export const FilesPage: React.FC = () => {
    const { desk, hasEditPermission } = useOutletContext<DeskOutletContext>();
    const { id: deskId } = useParams<{ id: string }>();
    const numericDeskId = deskId ? Number(deskId) : null;

    const [files, setFiles] = useState<DeskFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Состояния для модалки удаления
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const loadFiles = useCallback(async () => {
        if (!numericDeskId) {
            setError("ID доски не определен.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const fetchedFiles = await FilesService.getFiles(numericDeskId);
            setFiles(fetchedFiles?.map(f => ({ ...f, id: String(f.id) })) || []);
        } catch (err: any) {
            setError('Не удалось загрузить список файлов.');
            console.error("Ошибка загрузки списка файлов:", err);
        } finally {
            setIsLoading(false);
        }
    }, [numericDeskId]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile || !numericDeskId) return;

        setError(null);
        setIsUploading(true);

        try {
            console.log(`[FilesPage] Загрузка нового файла "${selectedFile.name}".`);
            await FilesService.uploadDeskFile(numericDeskId, selectedFile);
            console.log(`[FilesPage] Новый файл "${selectedFile.name}" успешно загружен.`);
            await loadFiles();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Неизвестная ошибка';
            setError(`Не удалось загрузить файл "${selectedFile.name}". Ошибка: ${errorMsg}`);
            console.error("Ошибка загрузки файла:", err);
        } finally {
            setIsUploading(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Функция для подтверждения удаления (вызывается из модалки)
    const confirmDeleteFile = async () => {
        if (!numericDeskId || !fileToDelete) return; // Проверяем, что файл выбран

        // Не сбрасываем setError здесь, чтобы ошибка из модалки не исчезла
        setIsDeleting(true);
        try {
            await FilesService.deleteDeskFile(numericDeskId, fileToDelete);
            setFiles(prevFiles => prevFiles.filter(f => f.filename !== fileToDelete));
            console.log(`[FilesPage] Файл ${fileToDelete} удален.`);
            // Закрываем модалку после успешного удаления
            handleCloseDeleteModal();
        } catch (err: any) {
            console.error("Ошибка удаления файла:", err);
             // Пробрасываем ошибку, чтобы модалка ее показала
            throw err;
        } finally {
            setIsDeleting(false);
        }
    };

    // Функция для открытия модалки при клике на иконку корзины
    const handleDeleteClick = (filename: string) => {
        setFileToDelete(filename);
        setIsDeleteModalOpen(true);
        setError(null); // Сбрасываем общую ошибку страницы при открытии модалки
    };

    // Функция для закрытия модалки
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setFileToDelete(null);
        // Не сбрасываем setError здесь, чтобы пользователь видел ошибку удаления, если она была
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center text-gray-600">
                <FaSpinner className="animate-spin mr-2" /> Загрузка файлов...
            </div>
        );
    }

    // Обернем все в React.Fragment (<> </>) для добавления модалки
    return (
        <>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Файлы доски: {desk?.deskName || `(ID: ${numericDeskId})` || 'Загрузка...'}
                    </h1>
                    {hasEditPermission && (
                        <div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploading}/>
                            <Button onClick={handleUploadClick} disabled={isUploading}>
                                {isUploading ? (<><FaSpinner className="animate-spin mr-2" /> Загрузка...</>) : (<><FaUpload className="mr-2" /> Загрузить файл</>)}
                            </Button>
                        </div>
                    )}
                </div>

                {error && !isDeleteModalOpen && ( // Показываем общую ошибку только если модалка закрыта
                     <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded flex items-center">
                         <FaExclamationTriangle className="mr-2 flex-shrink-0"/> {error}
                    </div>
                )}

                {files.length === 0 && !isLoading && !error && (
                    <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-md">
                        Нет прикрепленных файлов.
                    </div>
                )}

                {files.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                        {files.map((file) => {
                            const downloadUrl = numericDeskId ? FilesService.getDownloadUrl(numericDeskId, file.filename) : '#';
                            return (
                                <div
                                    key={file.id || file.filename}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-150 group relative"
                                >
                                    <div className="flex items-start mb-2 min-h-[40px]"> {/* min-h для выравнивания высоты */}
                                        <FaFileAlt className="text-gray-400 mr-3 mt-1 flex-shrink-0" size="1.2em" />
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.filename}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline break-words block"
                                            title={file.filename}
                                        >
                                            {file.filename}
                                        </a>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-auto pt-2 border-t border-gray-100">
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.filename}
                                            className="text-gray-400 hover:text-blue-600 transition-colors duration-150"
                                            title="Скачать"
                                        >
                                            <FaDownload size="1.1em"/>
                                        </a>
                                        {hasEditPermission && (
                                            <button
                                                onClick={() => handleDeleteClick(file.filename)}
                                                disabled={isUploading || isDeleting}
                                                className={`text-gray-400 hover:text-red-600 transition-colors duration-150 ${(isUploading || isDeleting) ? 'opacity-50 cursor-pointer' : 'cursor-pointer'}`}
                                                title="Удалить"
                                            >
                                                <FaTrash size="1.1em"/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Модальное окно подтверждения удаления */}
            {/* Рендерим модалку, если файл для удаления выбран */}
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

// Не забудь экспортировать, если это не default
// export default FilesPage; 