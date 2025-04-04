import React from 'react'
import {SearchBarProps} from '../types'

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, isLoading, inputRef }) => {
	return (
		<div className="mb-6">
			<label className="block text-sm font-medium text-gray-700 mb-1">
				Имя пользователя
			</label>
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					className="w-full p-2 rounded-md bg-gray-50 focus:outline-none"
					style={{
						border: '1px solid var(--theme-color)',
						'--tw-ring-color': 'var(--theme-color)',
						'--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
						'--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
						boxShadow: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)'
					} as React.CSSProperties}
					placeholder="Введите имя пользователя"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				{isLoading && (
					<div className="absolute right-3 top-2.5">
						<div 
							className="animate-spin h-5 w-5 border-2 rounded-full border-t-transparent"
							style={{ borderColor: 'var(--theme-color)', borderTopColor: 'transparent' }}
						></div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;