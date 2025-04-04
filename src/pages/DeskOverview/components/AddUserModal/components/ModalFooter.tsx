import React from 'react'
import {ModalFooterProps} from '../types'

const ModalFooter: React.FC<ModalFooterProps> = ({ onClose, handleAddUser, isLoading, selectedUser, error }) => {
	return (
		<>
			{error && (
				<div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
					{error}
				</div>
			)}

			<div className="flex justify-end gap-2">
				<button
					onClick={onClose}
					className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
				>
					Отмена
				</button>

				{selectedUser && (
					<button
						onClick={handleAddUser}
						disabled={isLoading}
						className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out cursor-pointer${
							isLoading ? 'opacity-70 cursor-not-allowed' : ''
						}`}
						style={{ 
							backgroundColor: 'var(--theme-color)',
							'--tw-ring-color': 'var(--theme-color)' 
						} as React.CSSProperties}
						onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--theme-color-dark)')}
						onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--theme-color)')}
					>
						{isLoading ? (
							<>
								<span className="inline-block animate-spin mr-2">⟳</span>
								Добавление...
							</>
						) : (
							'Добавить'
						)}
					</button>
				)}
			</div>
		</>
	);
};

export default ModalFooter;