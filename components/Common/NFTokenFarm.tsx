import { baseURLParas } from 'constants/baseUrl'
import { INFToken } from 'interfaces/token'
import { parseImgUrl } from 'utils/common'
import Button from './Button'
import Media from './Media'

interface NFTokenFarmProps {
	token: INFToken
	stakeNFT: (tokenId: string, contractId: string) => void
	type: 'unstake' | 'stake'
	point: string
}

const NFTokenFarm = ({ token, stakeNFT, type, point }: NFTokenFarmProps) => {
	if (!token.metadata) {
		return null
	}

	const tokenUrl = `${baseURLParas}/token/${token.contract_id}::${token.token_series_id}/${token.token_id}`
	const collectionUrl = `${baseURLParas}/collection/${token.metadata.collection_id}`

	return (
		<div className="flex justify-between mb-4 md:mb-0 p-3 border-2 border-borderGray rounded-xl h-[11rem] shadow-lg overflow-hidden">
			<div className="w-1/2 pr-4">
				<div className="w-full h-full">
					<Media
						url={parseImgUrl(token.metadata.media, '', { isMediaCdn: token.isMediaCdn })}
						videoControls={false}
						videoMuted={true}
						videoLoop={true}
						className="w-full h-full object-contain"
					/>
				</div>
			</div>
			<div className="w-1/2 m-auto">
				<div className="overflow-ellipsis truncate">
					<a href={tokenUrl} target="_blank" rel="noreferrer">
						<p className="font-bold text-lg hover:opacity-80 inline">{token.metadata.title}</p>
					</a>
				</div>
				<div className="overflow-ellipsis truncate">
					<a href={collectionUrl} target="_blank" rel="noreferrer">
						<p className="opacity-70 hover:opacity-50 text-sm inline">
							{token.metadata.collection}
						</p>
					</a>
				</div>
				<p className="font-bold text-xs">{`Value: ${point} Pts`}</p>
				<Button
					className="px-6 mt-4"
					size="md"
					color={type === 'stake' ? 'blue' : 'blue-gray'}
					onClick={() => stakeNFT(token.token_id, token.contract_id)}
				>
					{type === 'stake' ? 'Stake' : 'Unstake'}
				</Button>
			</div>
		</div>
	)
}

export default NFTokenFarm
