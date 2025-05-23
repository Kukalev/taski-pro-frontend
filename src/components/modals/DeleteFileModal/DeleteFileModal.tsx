import {useState} from 'react'

interface DeleteFileModalProps {
    isOpen: boolean;
    filename: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export const DeleteFileModal = ({
    isOpen,
    filename,
    onClose,
    onConfirm,
    isLoading
}: DeleteFileModalProps) => {
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setError('');
        try {
            await onConfirm();
            onClose();
        } catch (error: any) {
            console.error('Ошибка при удалении файла:', error);
            setError(error.response?.data?.message || error.message || 'Не удалось удалить файл');
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex min-h-screen items-center justify-center px-4'>
                <div
                    className='fixed inset-0 bg-black opacity-40 transition-opacity'
                    onClick={!isLoading ? onClose : undefined}
                ></div>

                <div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
                    <h2 className='mb-4 text-xl font-semibold'>Удаление файла</h2>

                    <p className='mb-6'>
                        Вы уверены, что хотите удалить файл

                        <span className='font-medium break-all'> "{filename}"</span>?
                        Это действие нельзя отменить.
                    </p>

                    {error && (
                        <div className='mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md text-sm'>
                            {error}
                        </div>
                    )}

                    <div className='flex justify-end space-x-3'>
                        <button
                            type='button'
                            onClick={onClose}
                            disabled={isLoading}
                            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50'
                        >
                            Отмена
                        </button>
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={isLoading}
                            className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-70 flex items-center justify-center'
                        >
                            {isLoading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? 'Удаление...' : 'Удалить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


