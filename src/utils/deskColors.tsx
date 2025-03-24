// Массив цветов для иконок досок
const DESK_COLORS = [
	'bg-orange-400 text-orange-700', 
	'bg-pink-400 text-pink-700', 
	'bg-red-400 text-red-700', 
	'bg-blue-400 text-blue-700',
	'bg-green-400 text-green-700', 
	'bg-purple-400 text-purple-700', 
	'bg-yellow-400 text-yellow-700', 
	'bg-indigo-400 text-indigo-700'
];

/**
 * Возвращает цвет для доски на основе ID
 * @param id ID доски
 * @returns Строка с классами Tailwind для фона и текста
 */
export const getDeskColor = (id: number): string => {
	return DESK_COLORS[id % DESK_COLORS.length]
}

/**
 * Создает цветной блок с первой буквой названия доски
 * @param name Название доски
 * @param id ID доски
 * @returns JSX элемент цветного блока
 */
export const DeskColorIcon = ({ name, id }: { name: string, id: number }) => {
	const colorClass = getDeskColor(id)
	const firstLetter = name.charAt(0).toUpperCase()

	return <div className={`w-5 h-5 rounded flex items-center justify-center ${colorClass}`}>{firstLetter}</div>
}
