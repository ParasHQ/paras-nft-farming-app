import Modal from 'components/Common/Modal'
import IconClose from 'components/Icon/IconClose'

interface InfoModalProps {
	show: boolean
	nftMultiplier: {
		[key: string]: number
	}
	onClose: () => void
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
					<div>Card link</div>
					<div>Multiplier</div>
				</div>
				<div className="h-[40vh] md:h-[50vh] overflow-y-scroll no-scrollbar">
					{Object.entries(props.nftMultiplier).map(([key, value], index) => (
						<div key={index} className="mb-1 flex justify-between">
							<a
								href={formatText(key)}
								target="_blank"
								className="opacity-80 hover:opacity-60 text-xs"
								rel="noreferrer"
							>
								{formatText(key)}
							</a>
							<p className="text-xs">{value}</p>
						</div>
					))}
				</div>
			</div>
		</Modal>
	)
}

export default InfoModal
