import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'

interface StakeModalProps {
	show: boolean
	onClose: () => void
	onClickStake: () => void
}

const StakeModal = (props: StakeModalProps) => {
	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="text-center relative mb-4">
					<div
						className="absolute inset-y-0 left-0 flex items-center cursor-pointer"
						onClick={props.onClose}
					>
						<IconBack />
					</div>
					<p className="font-bold text-xl text-white">Stake</p>
					<p className="text-white text-sm -mt-1">Pillars of Paras Pool</p>
				</div>
				<div className="mb-10">
					<p className="opacity-80 text-right text-white text-sm mb-1">Balance: 1000</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText className="border-none" type="number" placeholder="0.0" />
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
				</div>
				<Button onClick={props.onClickStake} isFullWidth size="lg">
					Stake
				</Button>
			</div>
		</Modal>
	)
}

export default StakeModal
