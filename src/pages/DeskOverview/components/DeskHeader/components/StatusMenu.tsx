import React from 'react'
import {DeskStatus, StatusMenuProps} from '../types'

const StatusMenu: React.FC<StatusMenuProps> = ({
	isOpen,
	handleStatusChange,
	statusMenuRef
}) => {
	if (!isOpen) return null;

	return (
		<div
			ref={statusMenuRef}
			className="absolute right-0 mt-1 rounded-md shadow-lg bg-white z-10"
			style={{
				width: '150px',
				border: '1px solid #f3f4f6'
			}}
		>
			<div className="py-1">
				<button
					className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
					onClick={() => handleStatusChange(DeskStatus.INACTIVE)}
				>
					<span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
					<span className="text-sm">Не активный</span>
				</button>
				<button
					className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
					onClick={() => handleStatusChange(DeskStatus.IN_PROGRESS)}
				>
					<span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
					<span className="text-sm">В работе</span>
				</button>
				<button
					className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
					onClick={() => handleStatusChange(DeskStatus.AT_RISK)}
				>
					<span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
					<span className="text-sm">Под угрозой</span>
				</button>
				<button
					className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
					onClick={() => handleStatusChange(DeskStatus.PAUSED)}
				>
					<span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
					<span className="text-sm">Приостановлен</span>
				</button>
			</div>
		</div>
	);
};

export default StatusMenu;