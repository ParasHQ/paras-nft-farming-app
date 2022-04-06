import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import { useState } from 'react'

interface ClaimModalProps {
	show: boolean
	type: string
	poolname: string
	claimAndWithdraw(): void
	claimAndDeposit(): void
	onClose: () => void
	claimableRewards: {
		[key: string]: string
	}
}

type TActiveOption = 'claim-and-stake' | 'claim-and-withdraw'

const ClaimModal = ({
	show,
	type,
	onClose,
	claimAndWithdraw,
	claimAndDeposit,
	poolname,
	claimableRewards,
}: ClaimModalProps) => {
	const [activeOption, setActiveOption] = useState<TActiveOption>('claim-and-stake')

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full rounded-md mx-4 md:m-auto max-w-xs p-4">
				<div className="mb-2">
					<p className="text-white text-sm text-right -mt-2 -mx-1">{poolname}</p>
					<p className="font-medium text-xl mb-1">Reward</p>
					{Object.keys(claimableRewards).map((k) => (
						<PoolReward key={k} contractName={k} amount={claimableRewards[k]} className="text-xl" />
					))}
				</div>
				<div className="-mx-2">
					<div
						className={`${
							activeOption === 'claim-and-stake' && 'bg-gray-100 bg-opacity-10'
						} hover:bg-gray-100 hover:bg-opacity-10 px-3 py-2 cursor-pointer rounded-md`}
						onClick={() => setActiveOption('claim-and-stake')}
					>
						<p className="font-semibold">Claim and Stake</p>
						<p className="text-xs text-gray-400">
							Claim your {poolname} reward and deposit your $PARAS to the $PARAS pool (compounding)
						</p>
						{type === 'nft' && (
							<p className="text-xs text-gray-400 mt-1">
								{/* *This will also compound your reward from $PARAS pool */}
								*The reward from $PARAS pool will be deposited to the $PARAS pool
							</p>
						)}
					</div>
					<div
						className={`${
							activeOption === 'claim-and-withdraw' && 'bg-gray-100 bg-opacity-10'
						} hover:bg-gray-100 hover:bg-opacity-10 px-3 py-2 cursor-pointer rounded-md mt-1`}
						onClick={() => setActiveOption('claim-and-withdraw')}
					>
						<p className="font-semibold">Claim and Withdraw</p>
						<p className="text-xs text-gray-400">
							Claim your reward and withdraw the reward to your wallet
						</p>
					</div>
				</div>
				<div className="mt-3 text-right">
					<Button
						color="green"
						className="px-8"
						onClick={activeOption === 'claim-and-stake' ? claimAndDeposit : claimAndWithdraw}
					>
						Proceed
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ClaimModal
