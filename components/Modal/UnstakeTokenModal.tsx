import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { ModalCommonProps } from 'interfaces/modal'
import JSBI from 'jsbi'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import near, { CONTRACT, getAmount } from 'services/near'
import { formatParasAmount, hasReward, parseParasAmount, prettyBalance } from 'utils/common'

interface UnstakeTokenModalProps extends ModalCommonProps {
	claimableRewards: {
		[key: string]: string
	}
}

interface UnstakesTokenForm {
	inputUnstake: string
}

const UnstakeTokenModal = (props: UnstakeTokenModalProps) => {
	const { accountId } = useNearProvider()
	const [balance, setBalance] = useState('0')
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<UnstakesTokenForm>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [userDelegations, setUserDelegations] = useState({
		next_withdraw_timestamp: (new Date().getTime() - 1).toString(),
		undelegated_seeds: '0',
		delegated_seeds: '0',
		free_seeds: '0',
	})

	const getStakedBalance = useCallback(async () => {
		const balanceStaked = await near.nearViewFunction({
			methodName: 'list_user_seeds',
			contractName: CONTRACT.FARM,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setBalance(balanceStaked[props.seedId])
	}, [props.seedId])

	const getUserDelegations = async () => {
		const userDelegate = await near.nearViewFunction({
			methodName: 'get_user_delegations',
			contractName: CONTRACT.FARM,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setUserDelegations(userDelegate)
	}

	useEffect(() => {
		if (props.show) {
			getStakedBalance()
			getUserDelegations()
		}
	}, [props.show, getStakedBalance])

	const unstakeToken = async ({ inputUnstake }: UnstakesTokenForm) => {
		try {
			const txs: {
				receiverId: string
				functionCalls: FunctionCallOptions[]
			}[] = []

			for (const contractName of Object.keys(props.claimableRewards || {})) {
				const deposited = await near.nearViewFunction({
					contractName: contractName,
					methodName: `storage_balance_of`,
					args: {
						account_id: near.wallet.getAccountId(),
					},
				})

				if (deposited === null || (deposited && deposited.total === '0')) {
					txs.push({
						receiverId: contractName,
						functionCalls: [
							{
								methodName: 'storage_deposit',
								contractId: contractName,
								args: {
									registration_only: true,
									account_id: accountId,
								},
								attachedDeposit: getAmount(parseNearAmount('0.00125')),
								gas: getAmount(GAS_FEE[30]),
							},
						],
					})
				}
			}

			txs.push({
				receiverId: CONTRACT.FARM,
				functionCalls: [
					{
						methodName: 'withdraw_seed',
						contractId: CONTRACT.FARM,
						args: {
							seed_id: props.seedId,
							amount: parseParasAmount(inputUnstake),
						},
						attachedDeposit: getAmount('1'),
						gas: getAmount(GAS_FEE[200]),
					},
				],
			})

			return await near.executeMultipleTransactions(txs)
		} catch (err) {
			console.log(err)
			setIsSubmitting(false)
		}
	}

	const getPendingFromUndelegate = () => {
		const nextWithdrawUndelegate = new Date(
			parseInt(userDelegations.next_withdraw_timestamp) / 10 ** 6
		)
		if (nextWithdrawUndelegate.getTime() < new Date().getTime()) {
			return '0'
		} else {
			return userDelegations.undelegated_seeds
		}
	}

	const getAvailableToUnstake = () => {
		const nonDelegated = JSBI.subtract(
			JSBI.BigInt(balance),
			JSBI.BigInt(userDelegations.delegated_seeds)
		)
		const availableToUnstake = JSBI.subtract(nonDelegated, JSBI.BigInt(getPendingFromUndelegate()))
		return availableToUnstake.toString()
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
					<div className="opacity-80 text-white text-sm flex justify-between">
						<p>Staked PARAS:</p>
						<p>{prettyBalance(balance)} ℗</p>
					</div>
					{userDelegations.delegated_seeds !== '0' && (
						<div className="opacity-80 text-white text-sm flex justify-between">
							<p>Added to Voting Power:</p>
							<p>-{prettyBalance(userDelegations.delegated_seeds)} ℗</p>
						</div>
					)}
					{getPendingFromUndelegate() !== '0' && (
						<div className="opacity-80 text-white text-sm flex justify-between">
							<p>Pending from vote balance:</p>
							<p>-{prettyBalance(getPendingFromUndelegate())} ℗</p>
						</div>
					)}
					<div className="text-white text-sm mt-1 mb-2 flex justify-between font-medium">
						<p>Available to Unstake:</p>
						<p>{prettyBalance(getAvailableToUnstake())} ℗</p>
					</div>

					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							{...register('inputUnstake', {
								required: true,
								min: 0.1,
								max: formatParasAmount(getAvailableToUnstake()),
							})}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					{errors.inputUnstake?.type === 'min' && (
						<span className="text-red-500 text-xs">Min is 0.1 PARAS</span>
					)}
					{errors.inputUnstake?.type === 'required' && (
						<span className="text-red-500 text-xs">This field is required</span>
					)}
					{errors.inputUnstake?.type === 'max' && (
						<span className="text-red-500 text-xs">
							Max is {prettyBalance(getAvailableToUnstake(), 18, 4)} PARAS
						</span>
					)}
					<div className="text-left">
						<Button
							onClick={() =>
								setValue('inputUnstake', formatParasAmount(getAvailableToUnstake()), {
									shouldValidate: true,
								})
							}
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
					onClick={handleSubmit(unstakeToken)}
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
