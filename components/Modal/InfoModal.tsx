import axios from 'axios'
import Media from 'components/Common/Media'
import Modal from 'components/Common/Modal'
import IconClose from 'components/Icon/IconClose'
import { apiParasUrl } from 'constants/apiURL'
import { INFToken } from 'interfaces/token'
import { useEffect, useState } from 'react'
import { prettyBalance } from 'utils/common'

interface InfoModalProps {
	show: boolean
	nftPoints: {
		[key: string]: string
	}
	onClose: () => void
}

interface NFTProps {
	contractId: string
	tokenSeriesId: string
}

const NFT = ({ contractId, tokenSeriesId }: NFTProps) => {
	const [data, setData] = useState<INFToken>()

	useEffect(() => {
		if (contractId && tokenSeriesId) {
			const fetchNFT = async () => {
				try {
					const resp = await axios.get(`${apiParasUrl}/token-series`, {
						params: {
							contract_id: contractId,
							token_series_id: tokenSeriesId,
						},
					})

					setData(resp.data.data.results[0])
				} catch (error) {
					console.log(error)
				}
			}

			fetchNFT()
		}
	}, [contractId, tokenSeriesId])

	return (
		<div className="w-24 h-24 rounded-md overflow-hidden relative">
			{data?.metadata && (
				<div className="absolute inset-0">
					<Media
						className="h-full object-cover relative z-10 img-hor-vert"
						url={data.metadata.media}
						videoControls={false}
						videoMuted={true}
						videoLoop={true}
					/>
				</div>
			)}
		</div>
	)
}

const InfoModal = (props: InfoModalProps) => {
	const formatText = (text: string) => {
		const [contractId, tokenId] = text.split('@')
		return `https://paras.id/token/${contractId}::${tokenId}`
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm md:max-w-md w-full bg-parasGrey rounded-lg m-auto shadow-xl p-8">
				<div className="font-medium mb-2 flex gap-3 items-center text-xl relative">
					<div className="absolute right-0 top-0 -m-4 cursor-pointer" onClick={props.onClose}>
						<IconClose />
					</div>
					<div>NFT that can be applied in this pool</div>
				</div>
				<div className="text-sm opacity-80 mb-4">
					Paragraph description about the Pool. Lorem ipsum dolor sit amet, consectetur adipiscing
					elit. Cras mollis a velit sed tristique. Nunc vehicula urna ac tempor condimentum.
					Praesent bibendum id orci ac condimentum.
				</div>
				<div className="flex text-sm justify-between mb-2">
					<div>NFT</div>
					<div>Link</div>
					<div>Value</div>
				</div>
				<div className="h-[40vh] md:h-[50vh] overflow-y-scroll no-scrollbar">
					{props.nftPoints &&
						Object.entries(props.nftPoints).map(([key, value], index) => {
							const [contract_id, token_series_id] = key.split(`@`)
							return (
								<div key={index} className="mt-4 flex items-center justify-between">
									<div className="w-1/3">
										<NFT contractId={contract_id} tokenSeriesId={token_series_id.split(':')[0]} />
									</div>

									<div className="w-1/3">
										<a
											href={formatText(key)}
											target="_blank"
											className="opacity-80 hover:opacity-60 text-xs"
											rel="noreferrer"
										>
											{formatText(key)}
										</a>
									</div>
									<div className="w-1/3 text-right">
										<p>{prettyBalance(value, 18, 4)} Pts</p>
									</div>
								</div>
							)
						})}
				</div>
			</div>
		</Modal>
	)
}

export default InfoModal
