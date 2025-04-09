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

    // Возвращаем функцию удаления
    const handleDeleteFile = async (filename: string) => {
        if (!numericDeskId || !window.confirm(`Вы уверены, что хотите удалить файл "${filename}"?`)) return;

        setError(null);
        // Можно добавить индикатор загрузки для удаления, если нужно
        try {
            await FilesService.deleteDeskFile(numericDeskId, filename);
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

            {/* === Условный рендеринг списка файлов или сообщения "нет файлов" === */}
            {/* Этот блок должен быть ВНЕ любого map */}
            {files.length > 0 ? (
                // Контейнер сетки: используем grid, задаем колонки для разных размеров экрана и отступы
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4"> {/* Добавил mt-4 для отступа */} 
                    {/* Рендерим карточку для каждого файла - ЭТОТ map должен быть здесь */}
                    {files.map((file) => {
                        // Генерируем URL для скачивания здесь
                        const downloadUrl = numericDeskId ? FilesService.getDownloadUrl(numericDeskId, file.filename) : '#';

                        return (
                            // Карточка файла: стилизуем фон, рамку, тень, паддинги, делаем flex-контейнером
                            <div
                                key={file.id || file.filename} // Уникальный ключ для элемента списка
                                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-150 group relative"
                            >
                                {/* Верхняя часть карточки: иконка и имя файла */}
                                <div className="flex items-start mb-2 min-h-[40px]"> {/* min-h для выравнивания высоты */}
                                    {/* Иконка файла */}
                                    <FaFileAlt className="text-gray-400 mr-3 mt-1 flex-shrink-0" size="1.2em" />
                                    {/* Имя файла как ссылка для скачивания */}
                                    <a
                                        href={downloadUrl}
                                        target="_blank" // Открыть в новой вкладке
                                        rel="noopener noreferrer" // Безопасность
                                        download={file.filename} // Предложить скачать с этим именем
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline break-words block" // Стили ссылки, перенос слов
                                        title={file.filename} // Всплывающая подсказка с полным именем
                                    >
                                        {file.filename} {/* Отображаем имя файла */}
                                    </a>
                                </div>
                               

                                {/* Нижняя часть карточки: кнопки действий */}
                                <div className="flex justify-end space-x-3 mt-auto pt-2 border-t border-gray-100"> {/* Прижимаем кнопки вниз (mt-auto), выравниваем вправо */}
                                    {/* Кнопка/ссылка для скачивания */}
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
                                    {/* Кнопка Удалить (только если есть права) */}
                                    {hasEditPermission && (
                                        <button
                                            onClick={() => handleDeleteFile(file.filename)} // Вызываем удаление при клике
                                            disabled={isUploading} // Блокируем во время загрузки другого файла
                                            className={`text-gray-400 hover:text-red-600 transition-colors duration-150 ${isUploading ? 'cursor-pointer opacity-50' : 'cursor-pointer'}`}
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
            ) : (
                 // Сообщение, если файлов нет (и не идет загрузка, и нет ошибки)
                !isLoading && !error && (
                  <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">На этой доске пока нет файлов.</p>
                      {/* Кнопка загрузки первого файла (если есть права) */}
                      {hasEditPermission && (
                        <Button onClick={handleUploadClick} disabled={isUploading} className="mt-4">
                            {isUploading ? (
                              <><FaSpinner className="animate-spin mr-2" /> Загрузка...</>
                            ) : (
                              <><FaUpload className="mr-2" /> Загрузить первый файл</>
                            )}
                        </Button>
                      )}
                  </div>
                )
            )}
        </div>
    );
};

// Не забудь экспортировать, если это не default
// export default FilesPage; 