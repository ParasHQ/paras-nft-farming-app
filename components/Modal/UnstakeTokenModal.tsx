import { Transaction } from '@near-wallet-selector/core'
import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { getAmount, useWalletSelector } from 'contexts/WalletSelectorContext'
import { ModalCommonProps } from 'interfaces/modal'
import JSBI from 'jsbi'
import { trackStakingUnstakeParas } from 'lib/ga'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useCallback, useEffect, useState } from 'react'
import { formatParasAmount, hasReward, parseParasAmount, prettyBalance } from 'utils/common'
import { CONTRACT } from 'utils/contract'

interface UnstakeTokenModalProps extends ModalCommonProps {
	claimableRewards: {
		[key: string]: string
	}
	userLocked: string
}

const UnstakeTokenModal = (props: UnstakeTokenModalProps) => {
	const { accountId, viewFunction, signAndSendTransactions } = useWalletSelector()
	const [balance, setBalance] = useState('0')
	const [inputUnstake, setInputUnstake] = useState<number | string>('')
	const [rawInputStake, setRawInputStake] = useState<JSBI | string>('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const getStakedBalance = useCallback(async () => {
		const balanceStaked = await viewFunction<string>({
			receiverId: CONTRACT.FARM,
			methodName: 'list_user_seeds',
			args: {
				account_id: accountId,
			},
		})
		setBalance(balanceStaked[props.seedId as unknown as number])
	}, [props.seedId])

	useEffect(() => {
		if (props.show) {
			getStakedBalance()
		}
	}, [props.show, getStakedBalance])

	const unstakeToken = async () => {
		trackStakingUnstakeParas(`${inputUnstake}`, accountId)
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
									deposit: getAmount(parseNearAmount('0.00125')) as unknown as string,
									gas: getAmount(GAS_FEE[30]) as unknown as string,
								},
							},
						],
						signerId: contractName,
					})
				}
			}

			txs.push({
				receiverId: CONTRACT.FARM,
				actions: [
					{
						type: 'FunctionCall',
						params: {
							methodName: 'withdraw_seed',
							args: {
								seed_id: props.seedId,
								amount: rawInputStake.toString(),
							},
							deposit: getAmount('1') as unknown as string,
							gas: getAmount(GAS_FEE[200]) as unknown as string,
						},
					},
				],
				signerId: CONTRACT.FARM,
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
						<p className="font-bold text-xl text-white">Unstake</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5" />
				</div>

				<div>
					<p className="opacity-80 text-right text-white text-sm mb-1">
						Balance:{' '}
						{prettyBalance(
							props.userLocked ? `${Number(balance) - Number(props.userLocked)}` : balance
						)}
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputUnstake}
							onChange={(event) => {
								setInputUnstake(event.target.value)
								setRawInputStake(parseParasAmount(event.target.value))
							}}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					<div className="text-left">
						<Button
							onClick={() => {
								if (balance) {
									if (props.userLocked) {
										setInputUnstake(
											`${
												Math.round(Number(balance) / 10 ** 18) -
												Math.round(Number(props.userLocked) / 10 ** 18)
											}`
										)
										setRawInputStake(
											JSBI.subtract(JSBI.BigInt(balance), JSBI.BigInt(props.userLocked))
										)
									} else {
										setInputUnstake(formatParasAmount(balance))
										setRawInputStake(balance)
									}
								}
							}}
							className="float-none mt-2 w-16"
							isDisabled={!balance}
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
							Unstaking will claim the rewards to your wallet:
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
					isDisabled={inputUnstake === '' || isSubmitting}
					onClick={unstakeToken}
					isFullWidth
					size="lg"
					color="blue-gray"
					className="mt-4"
				>
					Unstake
				</Button>
			</div>
		</Modal>
	)
}

export default UnstakeTokenModal
