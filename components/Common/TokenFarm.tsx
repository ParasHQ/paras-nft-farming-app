import { IToken } from 'interfaces/token'
import { parseImgUrl } from 'utils/common'
import Button from './Button'

interface TokenFarmProps {
	token: IToken
	stakeNFT: (tokenId: string, contractId: string) => void
}

const TokenFarm = ({ token, stakeNFT }: TokenFarmProps) => {
	const tokenUrl = `https://paras.id/token/${token.contract_id}:${token.token_series_id}/${token.token_id}`
	const collectionUrl = `https://paras.id/collection/${token.metadata.collection_id}`

	return (
		<div className="flex justify-between mb-4 md:mb-0 p-3 border-2 border-borderGray rounded-xl h-[9rem] shadow-lg overflow-hidden">
			<div className="w-1/2 pr-4">
				<div className="w-full h-full">
					<img
						src={parseImgUrl(token.metadata.media)}
						alt="token-image"
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
				<Button
					className="px-6 mt-4"
					size="md"
					onClick={() => stakeNFT(token.token_id, token.contract_id)}
				>
					Stake
				</Button>
			</div>
		</div>
	)
}

export default TokenFarm
