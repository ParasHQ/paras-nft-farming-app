import ContentLoader from 'react-content-loader'

const VotesLoader = (props: { [key: string]: unknown }) => (
	<ContentLoader
		speed={2}
		width="100%"
		height="100%"
		viewBox="0 0 352 150"
		className="my-4"
		backgroundColor="#576585"
		foregroundColor="#2b3653"
		uniqueKey="proposal-big-device-loader"
		opacity="0.15"
		{...props}
	>
		<rect x="0" y="0" rx="4" ry="4" width="352" height="20" />
		<rect x="0" y="30" rx="4" ry="4" width="352" height="20" />
		<rect x="0" y="60" rx="4" ry="4" width="352" height="20" />
		<rect x="0" y="90" rx="4" ry="4" width="352" height="20" />
		<rect x="0" y="120" rx="4" ry="4" width="352" height="20" />
	</ContentLoader>
)

export default VotesLoader
