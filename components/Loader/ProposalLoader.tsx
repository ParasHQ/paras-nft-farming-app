import ContentLoader from 'react-content-loader'

const ProposalBigDeviceLoader = (props: { [key: string]: unknown }) => (
	<ContentLoader
		speed={2}
		width="100%"
		height="100%"
		viewBox="0 0 352 120"
		className="mb-4 md:mb-8"
		backgroundColor="#576585"
		foregroundColor="#2b3653"
		uniqueKey="proposal-big-device-loader"
		opacity="0.15"
		{...props}
	>
		<rect x="0" y="0" rx="4" ry="4" width="352" height="120" />
	</ContentLoader>
)

const ProposalSmallDeviceLoader = (props: { [key: string]: unknown }) => (
	<ContentLoader
		speed={2}
		width="100%"
		height="100%"
		viewBox="0 0 352 200"
		className="mb-4 md:mb-8"
		backgroundColor="#576585"
		foregroundColor="#2b3653"
		uniqueKey="proposal-small-device-loader"
		opacity="0.15"
		{...props}
	>
		<rect x="0" y="0" rx="4" ry="4" width="352" height="200" />
	</ContentLoader>
)

const ProposalLoader = () => (
	<div>
		<div className="md:hidden">
			{[...Array(5).fill('')].map((k, index) => (
				<ProposalSmallDeviceLoader key={index} />
			))}
		</div>
		<div className="hidden md:block">
			{[...Array(5).fill('')].map((k, index) => (
				<ProposalBigDeviceLoader key={index} />
			))}
		</div>
	</div>
)

export default ProposalLoader
