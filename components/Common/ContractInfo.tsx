import axios from 'axios'
import Media from 'components/Common/Media'
import { apiParasUrl } from 'constants/apiURL'
import { ICollection } from 'interfaces/collection'
import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { prettyBalance } from 'utils/common'

interface NFTProps {
	contractId: string
	value: string
}

const ContractInfo = ({ contractId, value }: NFTProps) => {
	const [data, setData] = useState<ICollection>()
	const formatText = `https://paras.id/collection/${contractId}`
	const tooltipText = prettyBalance(value, 18, 2)

	useEffect(() => {
		if (contractId) {
			const fetchNFT = async () => {
				try {
					const resp = await axios.get(`${apiParasUrl}/collections`, {
						params: {
							collection_id: contractId,
						},
					})

					setData(resp.data.data.results[0])
				} catch (error) {
					console.log(error)
				}
			}

			fetchNFT()
		}
	}, [contractId])

	const openLink = () => {
		window.open(formatText, '_blank')
	}

	return (
		<div className="mt-4">
			<ReactTooltip html={true} id="eligible-nft" />
			<div className="flex items-center gap-3">
				<div
					className="w-20 h-20 rounded-full overflow-hidden relative my-2 cursor-pointer"
					onClick={openLink}
				>
					<Media
						className="w-full object-cover relative z-10"
						url={data?.media}
						videoControls={false}
						videoMuted={true}
						videoLoop={true}
					/>
				</div>
				<div className="flex-1 truncate w-full">
					<p className="text-sm">Collection</p>
					<p
						onClick={openLink}
						className="font-bold text-lg truncate cursor-pointer hover:underline inline"
					>
						{data?.collection}
					</p>
					<p className="text-sm opacity-80 truncate">by {data?.creator_id}</p>
				</div>
				<p
					data-tip={`<p class="text-base">*All NFT in this collection are valued ${tooltipText} Pts</p>`}
					data-for="eligible-nft"
					className="font-bold text-white opacity-100 cursor-default"
				>
					{prettyBalance(value, 18, 2)} Pts
				</p>
			</div>
		</div>
	)
}

export default ContractInfo
