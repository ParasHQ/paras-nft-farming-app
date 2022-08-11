/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	images: {
		domains: ['paras-ipfs.s3.ap-southeast-1.amazonaws.com', 'ipfs.fleek.co', 'cdn.paras.id'],
	},
	env: {
		NEXT_PUBLIC_API_FARMING: process.env.NEXT_PUBLIC_API_FARMING,
		NEXT_PUBLIC_API_PARAS: process.env.NEXT_PUBLIC_API_PARAS,
		NEXT_PUBLIC_DAO_CONTRACT: process.env.NEXT_PUBLIC_DAO_CONTRACT,
		NEXT_PUBLIC_NFT_FARM_CONTRACT: process.env.NEXT_PUBLIC_NFT_FARM_CONTRACT,
		NEXT_PUBLIC_PARAS_TOKEN_CONTRACT: process.env.NEXT_PUBLIC_PARAS_TOKEN_CONTRACT,
		NEXT_PUBLIC_WRAP_NEAR_CONTRACT: process.env.NEXT_PUBLIC_WRAP_NEAR_CONTRACT,
		NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
	},
}
