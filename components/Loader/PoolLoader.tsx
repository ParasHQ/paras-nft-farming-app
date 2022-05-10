import ContentLoader from 'react-content-loader'

const PoolLoader = (props: { [key: string]: unknown }) => (
	<ContentLoader
		speed={2}
		width="100%"
		height="100%"
		viewBox="0 0 352 500"
		backgroundColor="#576585"
		foregroundColor="#2b3653"
		opacity="0.15"
		{...props}
	>
		<rect x="26" y="26" rx="4" ry="4" width="300" height="120" />
		<rect x="26" y="170" rx="4" ry="4" width="300" height="300" />

		<rect x="0" y="0" rx="6" ry="6" width="6" height="100%" />
		<rect x="0" y="0" rx="6" ry="6" width="100%" height="6" />
		<rect x="0" y="494" rx="6" ry="6" width="100%" height="6" />
		<rect x="346" y="0" rx="6" ry="6" width="6" height="100%" />
	</ContentLoader>
)

export default PoolLoader
