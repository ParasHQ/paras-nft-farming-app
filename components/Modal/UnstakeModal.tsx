import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'

interface UnstakeModalProps {
	show: boolean
	onClose: () => void
	onClickUnstake: () => void
}

const UnstakeModal = (props: UnstakeModalProps) => {
	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5 cursor-pointer" onClick={props.onClose}>
						<IconBack />
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Stake</p>
						<p className="text-white text-sm -mt-1">Pillars of Paras Pool</p>
					</div>
					<div className="w-1/5" />
				</div>
				<div className="mb-10">
					<p className="opacity-80 text-right text-white text-sm mb-1">Balance: 1000</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText className="border-none" type="number" placeholder="0.0" />
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
				</div>
				<Button onClick={props.onClickUnstake} isFullWidth size="lg" color="red">
					Unstake
				</Button>
			</div>
		</Modal>
	)
}

export default UnstakeModal
