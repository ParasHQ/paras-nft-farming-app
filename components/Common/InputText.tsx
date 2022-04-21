import React, { forwardRef, InputHTMLAttributes } from 'react'

interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
	isError?: boolean
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
	({ className = '', isError = false, ...props }, ref) => {
		const inputBaseStyle = `${className} input-text flex items-center relative w-full px-3 py-2 rounded-lg`
		const inputBgStyle = 'bg-parasGrey placeholder-borderGray'
		const inputBorderStyle = 'outline-none border-2 border-borderGray'
		const inputTextStyle = 'text-white text-opacity-90 text-body text-base '

		const inputStyle = `${inputBaseStyle} ${inputBgStyle} ${inputBorderStyle} ${inputTextStyle} ${
			isError ? 'input-text--error' : ''
		}`

		return <input ref={ref} className={inputStyle} {...props} />
	}
)

export default InputText
