interface LoaderProps {
	isLoading: boolean
}

const Loader = ({ isLoading }: LoaderProps) => {
	return (
		<div
			className={`transition-opacity duration-150 fixed inset-0 z-50 bg-gray-900 flex items-center justify-center ${
				isLoading ? `opacity-100` : `opacity-0 z-[-1]`
			}`}
		>
			<LogoBounce />
		</div>
	)
}

export const LogoBounce = () => (
	<div>
		<div className="animate-bounce">
			<svg width="80" viewBox="0 0 600 713" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M95.2381 712.881L0 0L402.381 71.2881C419.486 75.7807 435.323 79.3925 449.906 82.7181C504.744 95.224 541.843 103.684 561.905 139.725C587.302 185.032 600 240.795 600 307.014C600 373.55 587.302 429.471 561.905 474.779C536.508 520.087 483.333 542.74 402.381 542.74H228.095L261.429 712.881H95.2381ZM147.619 147.329L364.777 185.407C374.008 187.807 382.555 189.736 390.426 191.513C420.02 198.193 440.042 202.712 450.869 221.963C464.575 246.164 471.428 275.95 471.428 311.321C471.428 346.861 464.575 376.731 450.869 400.932C437.163 425.133 408.466 437.234 364.777 437.234H265.578L205.798 432.481L147.619 147.329Z"
					fill="white"
				/>
			</svg>
		</div>
	</div>
)

export default Loader
