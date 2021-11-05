import React from 'react'

interface ButtonProps {
	children: React.ReactNode
	onClick: React.MouseEventHandler<HTMLButtonElement>
	isDisabled?: boolean
	isFullWidth?: boolean
	size?: 'sm' | 'md' | 'lg'
	color?: 'blue' | 'red' | 'green'
	className?: string
	style?: React.CSSProperties
}

const Button = ({
	isDisabled,
	isFullWidth,
	size = 'md',
	color = 'blue',
	children,
	className,
	style,
	onClick,
}: ButtonProps) => {
	const buttonBaseStyle =
		'inline-block text-center relative whitespace-nowrap font-medium hover:bg-opacity-80 shadow-md'
	const buttonTransition = 'transition duration-150 ease-in-out'
	const buttonDisabledStyle = isDisabled
		? 'cursor-not-allowed opacity-60 saturate-50 hover:bg-opacity-100'
		: ''
	const buttonWideStyle = isFullWidth ? 'w-full block' : ''

	const getColorStyle = (): string => {
		switch (color) {
			case 'blue':
				return 'bg-blueButton text-white'
			case 'red':
				return 'bg-redButton text-white'
			case 'green':
				return 'bg-greenButton text-white'
			default:
				return ''
		}
	}

	const getSizeStyle = (): string => {
		switch (size) {
			case 'lg':
				return 'py-3 px-20 text-base rounded-xl'
			case 'md':
				return 'py-2 px-6 text-sm rounded-lg'
			case 'sm':
				return 'py-1 px-4 text-xs rounded-md'
			default:
				return ''
		}
	}

	return (
		<button
			style={style}
			disabled={isDisabled}
			className={`${buttonBaseStyle} ${buttonTransition} ${getColorStyle()} ${getSizeStyle()} ${buttonDisabledStyle} ${buttonWideStyle} ${className}`}
			onClick={onClick}
		>
			{children}
		</button>
	)
}

export default Button
