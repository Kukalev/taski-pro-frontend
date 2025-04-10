import {useAuth} from '../../../../../contexts/AuthContext'
import {backgroundOptions} from '../../../../../styles/backgrounds'

export const BgThemes = () => {
	const { selectedBgThemeId, changeBgTheme } = useAuth();

	const handleSelectBackground = (id: string) => {
		changeBgTheme(id).catch(error => {
			console.error("Ошибка при смене фона из BgThemes:", error);
		});
	};

	return (
		<div className="mt-6">
			<h3 className="text-lg font-medium mb-4">Фоны</h3>
			<div className="grid grid-cols-3 gap-4">
				{backgroundOptions.map((option) => (
					<div key={option.id} className="cursor-pointer" onClick={() => handleSelectBackground(option.id)}>
						<div
							className={`w-full h-16 rounded-md border-2 mb-2 ${
								selectedBgThemeId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'
							}`}
							style={{
								backgroundImage: option.id === 'default' ? 'linear-gradient(to right, #e5e7eb, #f3f4f6)' : `url(${option.previewUrl})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							}}
							title={option.name}
						></div>
						<div className="flex items-center text-sm">
							<input
								type="radio"
								name="background-theme"
								id={`bg-${option.id}`}
								value={option.id}
								checked={selectedBgThemeId === option.id}
								onChange={() => handleSelectBackground(option.id)}
								className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
							/>
							<label htmlFor={`bg-${option.id}`} className="text-gray-700">{option.name}</label>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
