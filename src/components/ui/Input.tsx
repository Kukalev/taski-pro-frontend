import {useEffect, useRef, useState} from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	icon?: React.ReactNode
	value?: string
}

export const Input = ({icon, value, onChange, ...props}: InputProps) => {
	const [isFilled, setIsFilled] = useState(Boolean(value))
	const inputRef = useRef<HTMLInputElement>(null)
	const [isFocused, setIsFocused] = useState(false)

	useEffect(() => {
		setIsFilled(Boolean(value))
	}, [value])

	return (
		<div className={`relative group ${isFilled ? 'is-filled' : ''}`}>
			{icon && (
				<span
					className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 text-[20px]
          ${isFocused || isFilled ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
					{icon}
				</span>
			)}
			<input
				{...props}
				ref={inputRef}
				value={value}
				autoComplete='off'
				onChange={e => {
					if (onChange) onChange(e)
					setIsFilled(e.target.value.length > 0)
				}}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className={`w-full rounded-lg bg-white p-3 outline-none transition-all duration-300 border border-transparent
          ${icon ? 'pl-10' : 'pl-3'}
          ${isFocused ? 'border-blue-100 ring-1 ring-blue-100' : ''}
          font-medium text-sm
          ${
						isFocused || isFilled
							? 'text-gray-800 placeholder:text-gray-800'
							: 'text-gray-600 placeholder:text-gray-400 group-hover:placeholder:text-gray-600 group-hover:text-gray-600'
					}
          placeholder:font-medium placeholder:transition-colors placeholder:duration-300`}
			/>
		</div>
	)
}
