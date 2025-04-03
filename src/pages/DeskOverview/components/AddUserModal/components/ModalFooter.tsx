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
					className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
				>
					Отмена
				</button>

				{selectedUser && (
					<button
						onClick={handleAddUser}
						disabled={isLoading}
						className={`px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
							isLoading ? 'opacity-70 cursor-not-allowed' : ''
						}`}
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