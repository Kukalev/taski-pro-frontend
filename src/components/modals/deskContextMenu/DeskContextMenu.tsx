import { useEffect, useRef } from 'react'

interface DeskContextMenuProps {
	deskId: number
	isOpen: boolean
	onClose: () => void
	onRename: (id: number) => void
	onDelete: (id: number) => void
	position: { top: number; left: number }
}

export const DeskContextMenu = ({ deskId, isOpen, onClose, onRename, onDelete, position }: DeskContextMenuProps) => {
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div
			ref={menuRef}
			className='absolute bg-white rounded-md shadow-lg z-50 border border-gray-200 w-64'
			style={{
				top: position.top,
				left: position.left
			}}>
			<div className='py-1'>
				<button
					onClick={() => {
						onRename(deskId)
						onClose()
					}}
					className='cursor-pointer flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
					<svg className='mr-3 w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' />
						<path d='M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' />
					</svg>
					Переименовать
				</button>

				<button
					onClick={() => {
						onDelete(deskId)
						onClose()
					}}
					className='cursor-pointer flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100'>
					<svg className='mr-3 w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
					</svg>
					Удалить
				</button>
			</div>
		</div>
	)
}
