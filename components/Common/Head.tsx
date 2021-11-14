import NextHead from 'next/head'

interface HeadProps {
	title?: string
	description?: string
	image?: string
	url?: string
	keywords?: string
}

const Head = ({
	title = 'Paras Staking',
	description = 'Stake your $PARAS and NFT to get more rewards',
	image = '',
	url = 'https://stake.paras.com',
	keywords = 'stake, blockchain, near',
}: HeadProps) => {
	let _title = title === 'Paras Staking' ? 'Paras Staking' : `${title} - Paras Staking`

	return (
		<NextHead>
			<title>{_title}</title>
			<meta name="title" content={_title} />
			<meta name="description" content={description} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<meta property="og:title" content={_title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />
			<meta name="keywords" content={keywords} />
			<meta name="robots" content="index, follow" />
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={url} />
			<meta property="twitter:title" content={_title} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={image} />
		</NextHead>
	)
}

export default Head
