import {useEffect, useRef, useState} from 'react'
import {DeskService} from '../../../services/desk/Desk'
import {ModalButtons} from './components/ModalButtons'
import {ModalContent} from './components/ModalContent'
import {ModalHeader} from './components/ModalHeader'
import {CreateDeskModalProps} from './types/createDeskModal.types'
import {validateDeskData} from './utils/modalHelpers'
import {DeskResponseDto} from '../../../services/desk/types/desk.types.ts'

export const CreateDeskModal = ({ isOpen, onClose, onDeskCreated }: CreateDeskModalProps) => {
	const [deskName, setDeskName] = useState('')
	const [deskDescription, setDeskDescription] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const modalRef = useRef<HTMLDivElement>(null)

	const handleInternalClose = () => {
		console.log("Internal close: Resetting state and closing.");
		setDeskName('');
		setDeskDescription('');
		setError(null);
		onClose();
	};

	const handleOutsideClick = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			handleInternalClose();
		}
	}

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick)
		} else {
            setDeskName('');
            setDeskDescription('');
            setError(null);
        }
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [isOpen])



	const handleSubmit = async () => {
		setIsLoading(true)
		setError(null)

		try {
			const createDesk: DeskResponseDto = await DeskService.createDesk({
				deskName: deskName.trim(),
				deskDescription: deskDescription.trim()
			})
			console.log(createDesk, 'СОЗДАНИЕЕЕЕЕЕЕЕЕЕЕЕЕЕ')
			const newDesk = await DeskService.getDeskById(Number(createDesk.id))
			if (onDeskCreated) {
				onDeskCreated(newDesk)
			}
			handleInternalClose();
		} catch (error: any) {
			console.error('Ошибка при создании доски:', error)
			setError(error.message || 'Произошла ошибка при создании доски')
		} finally {
			setIsLoading(false)
		}
	}

	const isFormValid = validateDeskData(deskName)

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 flex items-center justify-center z-[9999]'>
			<div className='absolute inset-0 bg-black/20 backdrop-blur-[2px]' />

			<div ref={modalRef} className='relative bg-gray-100 rounded-xl w-[480px] shadow-xl'>
				<ModalHeader title='Создание доски' onClose={handleInternalClose} />

				<ModalContent deskName={deskName} deskDescription={deskDescription} setDeskName={setDeskName} setDeskDescription={setDeskDescription} error={error} />

				<ModalButtons onSubmit={handleSubmit} isValid={isFormValid} isLoading={isLoading} />
			</div>
		</div>
	)
}
