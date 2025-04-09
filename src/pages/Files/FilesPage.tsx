import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext, useParams} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {
    FaDownload,
    FaExclamationTriangle,
    FaSpinner,
    FaTrash,
    FaUpload
} from 'react-icons/fa'
import {DeskFile, DeskOutletContext} from './types'
import {FilesService} from '../../services/Files/Files'

export const FilesPage: React.FC = () => {
    const { desk, hasEditPermission } = useOutletContext<DeskOutletContext>();
    const { id: deskId } = useParams<{ id: string }>();
    const numericDeskId = deskId ? Number(deskId) : null;

    const [files, setFiles] = useState<DeskFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setFiles(fetchedFiles || []);
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
            await FilesService.uploadFile(numericDeskId, selectedFile);
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

    const handleDeleteFile = async (filename: string) => {
        if (!numericDeskId || !window.confirm(`Вы уверены, что хотите удалить файл "${filename}"?`)) return;

        setError(null);
        try {
            await FilesService.deleteFile(numericDeskId, filename);
            setFiles(prevFiles => prevFiles.filter(f => f.filename !== filename));
            console.log(`[FilesPage] Файл ${filename} удален.`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Неизвестная ошибка';
            setError(`Не удалось удалить файл "${filename}". Ошибка: ${errorMsg}`);
            console.error("Ошибка удаления файла:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center text-gray-600">
                <FaSpinner className="animate-spin mr-2" /> Загрузка файлов...
            </div>
        );
    }

    return (
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

            {error && (
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
                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {files.map((file) => {
                            const downloadUrl = numericDeskId ? FilesService.getDownloadUrl(numericDeskId, file.filename) : '#';
                            return (
                                <li key={file.id || file.filename} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150">
                                    <div className="flex items-center overflow-hidden mr-4">
                                        <div className="flex-grow overflow-hidden">
                                            <a
                                                href={downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={file.filename}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                                                title={`Скачать ${file.filename}`}
                                            >
                                                {file.filename}
                                            </a>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Метаданные недоступны
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-auto flex-shrink-0 flex items-center space-x-4">
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.filename}
                                            className="text-gray-500 hover:text-blue-600 transition-colors duration-150"
                                            title="Скачать"
                                        >
                                            <FaDownload />
                                        </a>
                                        {hasEditPermission && (
                                            <button
                                                onClick={() => handleDeleteFile(file.filename)}
                                                disabled={isUploading}
                                                className={`text-gray-500 hover:text-red-600 transition-colors duration-150 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                title="Удалить"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Не забудь экспортировать, если это не default
// export default FilesPage; 