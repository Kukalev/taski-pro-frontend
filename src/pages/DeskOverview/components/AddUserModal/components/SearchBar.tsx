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
					className="w-full p-2 border border-orange-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
					placeholder="Введите имя пользователя"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				{isLoading && (
					<div className="absolute right-3 top-2.5">
						<div className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent"></div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;