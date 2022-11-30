import { Transaction } from '@near-wallet-selector/core'
import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { useWalletSelector } from 'contexts/WalletSelectorContext'
import { ModalCommonProps } from 'interfaces/modal'
import { trackStakingStakeParas } from 'lib/ga'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useEffect, useState } from 'react'
import { formatParasAmount, hasReward, parseParasAmount, prettyBalance } from 'utils/common'
import { CONTRACT } from 'utils/contract'

interface StakeTokenModalProps extends ModalCommonProps {
	claimableRewards: {
		[key: string]: string
	}
}

const StakeTokenModal = (props: StakeTokenModalProps) => {
	const { accountId, viewFunction, signAndSendTransactions } = useWalletSelector()
	const [balance, setBalance] = useState('0')
	const [inputStake, setInputStake] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (props.show) {
			getParasBalance()
		}
	}, [props.show])

	const getParasBalance = async () => {
		const balanceParas = await viewFunction<string>({
			receiverId: CONTRACT.TOKEN,
			methodName: 'ft_balance_of',
			args: {
				account_id: accountId,
			},
		})
		setBalance(balanceParas)
	}

	const stakeToken = async () => {
		trackStakingStakeParas(inputStake, accountId)
		setIsSubmitting(true)

		try {
			const txs: Transaction[] = []

			for (const contractName of Object.keys(props.claimableRewards || {})) {
				const deposited = await viewFunction({
					receiverId: contractName,
					methodName: `storage_balance_of`,
					args: {
						account_id: accountId,
					},
				})

				if (deposited === null || (deposited && (deposited as any).total === '0')) {
					txs.push({
						receiverId: contractName,
						actions: [
							{
								type: 'FunctionCall',
								params: {
									methodName: 'storage_deposit',
									args: {
										registration_only: true,
										account_id: accountId,
									},
									deposit: parseNearAmount('0.00125') || '',
									gas: GAS_FEE[30],
								},
							},
						],
						signerId: accountId as string,
					})
				}
			}

			txs.push({
				receiverId: CONTRACT.TOKEN,
				actions: [
					{
						type: 'FunctionCall',
						params: {
							methodName: 'ft_transfer_call',
							args: {
								receiver_id: CONTRACT.FARM,
								amount: parseParasAmount(inputStake),
								msg: '',
							},
							deposit: '1',
							gas: GAS_FEE[200],
						},
					},
				],
				signerId: accountId as string,
			})

			return await signAndSendTransactions({ transactions: txs })
		} catch (err) {
			console.log(err)
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Stake</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5" />
				</div>

				<div>
					<p className="opacity-80 text-right text-white text-sm mb-1">
						Balance: {prettyBalance(balance)}
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputStake}
							onChange={(event) => setInputStake(event.target.value)}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					<div className="text-left">
						<Button
							onClick={() => setInputStake(formatParasAmount(balance))}
							className="float-none mt-2 w-16"
							size="sm"
							color="gray"
						>
							use max
						</Button>
					</div>
				</div>
				{hasReward(Object.values(props.claimableRewards)) && (
					<div className="text-center">
						<p className="font-semibold text-sm mt-2">
							Staking will claim the rewards to your wallet:
						</p>
						{Object.keys(props.claimableRewards).map((k, idx) => {
							return (
								<div key={idx} className="text-sm">
									<PoolReward key={k} contractName={k} amount={props.claimableRewards[k]} />
								</div>
							)
						})}
					</div>
				)}
				<Button
					isLoading={isSubmitting}
					isDisabled={inputStake === '' || isSubmitting}
					onClick={stakeToken}
					isFullWidth
					size="lg"
					className="mt-4"
				>
					Stake
				</Button>
			</div>
		</Modal>
	)
}

export default StakeTokenModal
