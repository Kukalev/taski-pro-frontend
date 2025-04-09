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

export const FilesPage: React.FC = () => {
    const { desk, hasEditPermission } = useOutletContext<DeskOutletContext>();
    const { id: deskId } = useParams<{ id: string }>();

    const [files, setFiles] = useState<DeskFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFiles = useCallback(async () => {
        if (!deskId) return;
        setIsLoading(true);
        setError(null);
        try {
            const fetchedFiles = await FilesService.getFiles(Number(deskId));
            setFiles(fetchedFiles);
        } catch (err) {
            setError('Не удалось загрузить список файлов.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [deskId]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !deskId) return;

        setIsUploading(true);
        setError(null);
        try {
            await FilesService.uploadFile(Number(deskId), file);
            await loadFiles();
        } catch (err) {
            setError(`Не удалось загрузить файл: ${file.name}`);
            console.error(err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteFile = async (filename: string) => {
        if (!deskId || !window.confirm(`Вы уверены, что хотите удалить файл "${filename}"?`)) return;

        setError(null);
        try {
            await FilesService.deleteFile(Number(deskId), filename);
            setFiles(prevFiles => prevFiles.filter(f => f.filename !== filename));
            console.log(`Файл ${filename} удален (заглушка).`);
        } catch (err) {
            setError('Не удалось удалить файл (заглушка).');
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Загрузка файлов...
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-gray-800">
                    Файлы доски: {desk?.deskName || 'Загрузка...'}
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
                 <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
                     <FaExclamationTriangle className="mr-2"/> {error}
                </div>
            )}

            {files.length === 0 && !isLoading && !error && (
                <div className="text-center text-gray-500 py-10">Нет прикрепленных файлов.</div>
            )}

            {files.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <ul className="divide-y divide-gray-200">
                        {files.map((file) => {
                            const downloadUrl = FilesService.getDownloadUrl(Number(deskId), file.filename);
                            return (
                                <li key={file.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center overflow-hidden">
                                        <div className="flex-grow overflow-hidden">
                                            <a
                                                href={downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="text-sm font-medium text-blue-600 hover:underline truncate block"
                                                title={file.filename}
                                            >
                                                {file.filename}
                                            </a>
                                            <p className="text-xs text-gray-400 italic">Метаданные недоступны</p>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-gray-400 hover:text-blue-600"
                                            title="Скачать"
                                        >
                                            <FaDownload />
                                        </a>
                                        {hasEditPermission && (
                                            <button
                                                onClick={() => handleDeleteFile(file.filename)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Удалить (Заглушка)"
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