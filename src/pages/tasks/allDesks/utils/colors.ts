export const getColorByFirstLetter = (letter: string): string => {
	const letterMap: { [key: string]: string } = {
		'0': 'bg-red-100 text-red-600',
		'1': 'bg-pink-100 text-pink-600',
		'2': 'bg-pink-100 text-pink-600',
		'3': 'bg-blue-100 text-blue-600',
		A: 'bg-amber-100 text-amber-600',
		Ф: 'bg-blue-100 text-blue-600',
		a: 'bg-amber-100 text-amber-600',
		ф: 'bg-blue-100 text-blue-600'
	}

	return letterMap[letter] || 'bg-green-100 text-green-600'
}
