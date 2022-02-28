import Modal from 'components/Common/Modal'
import NFTInfo from 'components/Common/NFTInfo'
import IconClose from 'components/Icon/IconClose'

interface InfoModalProps {
	show: boolean
	nftPoints: {
		[key: string]: string
	}
	onClose: () => void
}

const InfoModal = (props: InfoModalProps) => {
	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm md:max-w-md w-full bg-parasGrey rounded-lg m-auto shadow-xl p-6 md:p-8">
				<div className="font-bold mb-4 flex gap-3 items-center text-xl relative">
					<div
						className="absolute right-0 top-0 -m-3 md:-m-4 cursor-pointer"
						onClick={props.onClose}
					>
						<IconClose />
					</div>
					<div>Eligible NFTs</div>
				</div>
				<div className="flex text-sm font-medium justify-between">
					<div>NFT</div>
					<div>Value</div>
				</div>
				<div className="h-[40vh] md:h-[50vh] no-scrollbar">
					{props.nftPoints &&
						Object.entries(props.nftPoints).map(([key, value], index) => {
							const [contract_id, token] = key.split(`@`)
							const [token_series_id, token_id] = token.split(`::`)
							return (
								<NFTInfo
									key={index}
									contractId={contract_id}
									tokenSeriesId={token_series_id}
									tokenId={token_id}
									value={value}
								/>
							)
						})}
				</div>
			</div>
		</Modal>
	)
}

export default InfoModal
