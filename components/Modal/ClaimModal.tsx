import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconInfo from 'components/Icon/IconInfo'
import { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { CONTRACT } from 'services/near'
import { useStore } from 'services/store'

interface ClaimModalProps {
	show: boolean
	type: 'ft' | 'nft'
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
	const { ftPool } = useStore()

	const rewardPool = () => {
		return (
			<div className="flex justify-between">
				<p>{poolname}</p>
				<div className="text-right">
					{Object.keys(claimableRewards).map((k) => (
						<PoolReward key={k} contractName={k} amount={claimableRewards[k]} className="text-lg" />
					))}
				</div>
			</div>
		)
	}

	const rewardParasPool = () => {
		const hideReward = activeOption === 'claim-and-withdraw' || type === 'ft'

		return (
			<div className={hideReward ? 'hidden' : ''}>
				<div className={`justify-between ${hideReward ? 'hidden' : 'flex'}`}>
					<ReactTooltip html={true} />
					<div
						className="flex"
						// data-tip={`<p class="text-xs w-64">*The reward from $PARAS pool will also be compounded to the $PARAS pool and your wNEAR will be withdrawn to your wallet</p>`}
					>
						<p>Paras Pool</p>
						{/* <div className="pl-1 opacity-75">
							<IconInfo className="w-4 h-4" />
						</div> */}
					</div>
					<div className="text-right">
						{ftPool?.claimableRewards &&
							Object.keys(ftPool.claimableRewards).map((k) => {
								if (k === CONTRACT.TOKEN || k === CONTRACT.WRAP) {
									return (
										<PoolReward
											key={k}
											contractName={k}
											amount={ftPool.claimableRewards[k]}
											className="text-lg"
										/>
									)
								}
							})}
					</div>
				</div>
				{/* {type === 'nft' && (
					<p className="text-xs text-gray-400 mt-1">
						*The reward from $PARAS pool will also be compounded to the $PARAS pool and your wNEAR
						will be withdrawn to your wallet
					</p>
				)} */}
			</div>
		)
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="max-w-sm w-full bg-parasGrey text-white p-4 rounded-lg mx-4 sm:m-auto shadow-xl">
				<p className="font-semibold text-xl mb-2 text-center">Reward</p>
				<div className="-mx-2">
					<div
						className={`${
							activeOption === 'claim-and-stake' && 'bg-gray-100 bg-opacity-10'
						} px-3 py-2 cursor-pointer rounded-md`}
						onClick={() => setActiveOption('claim-and-stake')}
					>
						<p className="font-semibold">Claim and Stake</p>
						<p className="text-xs text-gray-400">
							Claim your {poolname} reward and deposit your $PARAS to the $PARAS pool (compounding)
						</p>
						{type === 'nft' && (
							<p className="text-xs text-gray-400 mt-1">
								{/* *This will also compound your reward from $PARAS pool */}
								*The reward from $PARAS pool will also be compounded to the $PARAS pool and your
								wNEAR will be withdrawn to your wallet
							</p>
						)}
					</div>
					<div
						className={`${
							activeOption === 'claim-and-withdraw' && 'bg-gray-100 bg-opacity-10'
						} px-3 py-2 cursor-pointer rounded-md mt-1`}
						onClick={() => setActiveOption('claim-and-withdraw')}
					>
						<p className="font-semibold">Claim and Withdraw</p>
						<p className="text-xs text-gray-400">
							Claim your reward and withdraw the reward to your wallet
						</p>
					</div>
				</div>
				<hr className="my-2 -mx-2 border-gray-500" />
				<div className="my-2">
					{rewardPool()}
					{rewardParasPool()}
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
