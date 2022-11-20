import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconInfo from 'components/Icon/IconInfo'
import { useWalletSelector } from 'contexts/WalletSelectorContext'
import JSBI from 'jsbi'
import { trackStakingRewardsParas } from 'lib/ga'
import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { CONTRACT } from 'services/near'
import { useStore } from 'services/store'
import { prettyBalance } from 'utils/common'

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

type TActiveOption = 'claim-and-stake' | 'claim-and-withdraw' | null

const ClaimModal = ({
	show,
	type,
	onClose,
	claimAndWithdraw,
	claimAndDeposit,
	poolname,
	claimableRewards,
}: ClaimModalProps) => {
	const [activeOption, setActiveOption] = useState<TActiveOption>(
		type === 'ft' ? 'claim-and-stake' : null
	)
	const [showError, setShowError] = useState<boolean>(false)
	const { ftPool } = useStore()
	const { accountId } = useWalletSelector()
	const hasNoParasRewardFromPool =
		claimableRewards[CONTRACT.TOKEN] && claimableRewards[CONTRACT.TOKEN] === '0'

	useEffect(() => {
		if (type === 'ft') {
			setActiveOption('claim-and-stake')
		} else {
			setActiveOption(null)
		}
	}, [show])

	useEffect(() => {
		if (activeOption) {
			setShowError(false)
		}
	}, [activeOption])

	const getCompoundedReward = () => {
		const reward = Object.assign({}, claimableRewards)

		// Compound FT rewards
		if (ftPool?.claimableRewards && type === 'nft') {
			Object.keys(ftPool.claimableRewards).forEach((key) => {
				if (reward[key]) {
					reward[key] = JSBI.add(
						JSBI.BigInt(reward[key]),
						JSBI.BigInt(ftPool.claimableRewards[key])
					).toString()
				} else {
					reward[key] = ftPool.claimableRewards[key]
				}
			})
		}

		return reward
	}

	const rewardToWallet = () => {
		return (
			<div className="flex justify-between">
				<p>To your wallet</p>
				<div className="text-right">
					{Object.keys(claimableRewards).map((k) => (
						<PoolReward key={k} contractName={k} amount={claimableRewards[k]} className="text-lg" />
					))}
				</div>
			</div>
		)
	}

	const rewardCompounded = () => {
		const compoundedReward = getCompoundedReward()
		const parasRewardFromNFTPool = prettyBalance(claimableRewards[CONTRACT.TOKEN], 18, 3)
		const parasRewardFromFTPool = prettyBalance(
			ftPool?.claimableRewards[CONTRACT.TOKEN] || '0',
			18,
			3
		)

		return (
			<div>
				<ReactTooltip html={true} />
				<div className="flex justify-between">
					<p>To your wallet</p>
					<div
						className="text-right flex items-center gap-1"
						{...(type === 'nft' && {
							'data-tip': `<p class="text-xs">wNEAR is from Paras Staking Pool</p>`,
						})}
					>
						<PoolReward
							key={CONTRACT.WRAP}
							contractName={CONTRACT.WRAP}
							amount={ftPool?.claimableRewards[CONTRACT.WRAP] || '0'}
							className="text-lg"
						/>
						{type === 'nft' && <IconInfo className="w-4 h-4" />}
					</div>
				</div>
				<div className="flex justify-between">
					<p>To PARAS Pool</p>
					<div
						className="text-right flex items-center gap-1"
						{...(type === 'nft' && {
							'data-tip': `<div class="text-xs w-48"><p>${parasRewardFromNFTPool} PARAS + ${parasRewardFromFTPool} PARAS</p><p>*Compounded with Paras Staking Pool Reward</p></div>`,
						})}
					>
						<PoolReward
							key={CONTRACT.TOKEN}
							contractName={CONTRACT.TOKEN}
							amount={compoundedReward[CONTRACT.TOKEN]}
							className="text-lg"
						/>
						{type === 'nft' && <IconInfo className="w-4 h-4" />}
					</div>
				</div>
				{type === 'nft' &&
					Object.keys(compoundedReward).map((k) => {
						if (k !== CONTRACT.TOKEN && k !== CONTRACT.WRAP) {
							return (
								<div key={k} className="flex justify-between">
									<p>Not Claimed</p>
									<div
										className="text-right flex items-center gap-1"
										data-tip={`<p class="text-xs w-48">This reward will not be claimed. To claim this reward please choose "Claim and Withdraw" option</p>`}
									>
										<PoolReward
											key={k}
											contractName={k}
											amount={compoundedReward[k]}
											className="text-lg"
										/>
										<IconInfo className="w-4 h-4" />
									</div>
								</div>
							)
						}
					})}
				{type === 'nft' && (
					<div className="mt-2">
						<p className="text-xs text-gray-400 mt-1">
							*The reward from $PARAS pool will also be compounded to the $PARAS pool and your wNEAR
							will be withdrawn to your wallet
						</p>
					</div>
				)}
			</div>
		)
	}

	const onClickProceedButton = () => {
		if (activeOption === null) {
			setShowError(true)
		} else if (activeOption === 'claim-and-stake') {
			trackStakingRewardsParas('claim-and-deposit', accountId)
			claimAndDeposit()
		} else if (activeOption === 'claim-and-withdraw') {
			trackStakingRewardsParas('claim-and-withdraw', accountId)
			claimAndWithdraw()
		}
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="max-w-sm w-full bg-parasGrey text-white p-4 rounded-lg mx-4 sm:m-auto shadow-xl">
				<p className="font-semibold text-xl mb-2 text-center">Reward</p>
				<div className="-mx-2 rounded-md">
					<div
						className={`${
							activeOption === 'claim-and-stake' && 'bg-gray-100 bg-opacity-10'
						} px-3 py-2 rounded-md ${
							hasNoParasRewardFromPool ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
						}`}
						onClick={() => !hasNoParasRewardFromPool && setActiveOption('claim-and-stake')}
					>
						<p className="font-semibold">Claim and Stake PARAS</p>
						<p className="text-xs text-gray-400">
							Claim your {poolname} reward and deposit your $PARAS to the $PARAS pool (compounding)
						</p>
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
					{activeOption === 'claim-and-stake' && rewardCompounded()}
					{activeOption === 'claim-and-withdraw' && rewardToWallet()}
				</div>
				{showError && <div className="text-red-500 my-2 text-sm">Please choose an option</div>}
				<div className="mt-3 text-right">
					<Button color="green" className="px-8" onClick={onClickProceedButton}>
						Proceed
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ClaimModal
