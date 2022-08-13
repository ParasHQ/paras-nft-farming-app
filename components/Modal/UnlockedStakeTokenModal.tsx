import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { A_DAY_IN_SECONDS } from 'constants/time'
import { useNearProvider } from 'hooks/useNearProvider'
import { ModalCommonProps } from 'interfaces/modal'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import React, { useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import { currentMemberLevel, parseParasAmount, prettyBalance } from 'utils/common'
import clsx from 'clsx'

interface UnlockedStakeModalProps extends ModalCommonProps {
	userStaked: string
	isTopup: boolean
	lockedBalance: number
	isWithinDuration: boolean
	lockedDuration: number
	claimableRewards: {
		[key: string]: string
	}
}

const UnlockedStakeTokenModal = (props: UnlockedStakeModalProps) => {
	const { accountId } = useNearProvider()
	const [inputValue, setInputValue] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [duration, setDuration] = useState<number>(0)
	const maxToUnlock = props.lockedBalance / 10 ** 18

	const isDisabledUnlockStakeButton = () =>
		Number(inputValue) > maxToUnlock ||
		!inputValue ||
		Number(inputValue) === 0 ||
		(getTotalLocked() > 0 && duration === 0)

	const getTotalLocked = () => {
		if (inputValue) return Math.floor(maxToUnlock * 100) / 100 - Number(inputValue)
		else return Math.floor(maxToUnlock * 100) / 100
	}

	const onClickDuration = (_duration: number) => {
		setDuration(_duration)
	}

	const onUnlockStake = async () => {
		const parseDuration: number = duration * A_DAY_IN_SECONDS
		const parseDurationTestnet: number = duration * 60
		setIsSubmitting(true)
		try {
			const txs: {
				receiverId: string
				functionCalls: FunctionCallOptions[]
			}[] = []
			const deposited = await near.nearViewFunction({
				contractName: CONTRACT.TOKEN,
				methodName: `storage_balance_of`,
				args: {
					account_id: accountId,
				},
			})

			if (deposited === null || (deposited && deposited.total === '0')) {
				txs.push({
					receiverId: CONTRACT.TOKEN,
					functionCalls: [
						{
							methodName: 'storage_deposit',
							contractId: CONTRACT.TOKEN,
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
			txs.push({
				receiverId: CONTRACT.FARM,
				functionCalls: [
					{
						methodName: 'unlock_ft_balance',
						contractId: CONTRACT.FARM,
						args: {
							seed_id: CONTRACT.TOKEN,
							amount: parseParasAmount(inputValue),
							...(duration > 0 && {
								duration:
									process.env.NEXT_PUBLIC_APP_ENV === 'mainnet'
										? parseDuration
										: parseDurationTestnet,
							}),
						},
						attachedDeposit: getAmount('1'),
						gas: getAmount(GAS_FEE[200]),
					},
				],
			})
			return await near.executeMultipleTransactions(txs)
		} catch (err) {
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose} closeOnEscape={false} closeOnBgClick={false}>
			<div className="max-w-md w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Unlocked Stake</p>
						<p className="text-white text-sm -mt-1">PARAS Locked Staking</p>
					</div>
					<div className="w-1/5" />
				</div>
				<div>
					<p className="opacity-80 text-white font-semibold text-sm mb-1">
						Current Member: {currentMemberLevel(getTotalLocked())}
					</p>
					<p className="opacity-80 text-right text-white text-sm mb-1">
						Locked Staking: {prettyBalance(`${props.lockedBalance}`, 18)} Ⓟ
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputValue}
							onChange={(event) => {
								setInputValue(event.target.value.replace(/^[^1-9][^.]/g, ''))
								Number(event.target.value) === maxToUnlock && setDuration(0)
							}}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					<div>
						<p
							className={clsx({
								['visible']: Number(inputValue) > maxToUnlock,
								['invisible']: Number(inputValue) <= maxToUnlock,
							})}
						>
							Not enough $PARAS
						</p>
					</div>
					<div className="text-left mb-4">
						<Button
							onClick={() => {
								setInputValue(`${maxToUnlock}`)
								setDuration(0)
							}}
							className="float-none w-16 border border-blueButton"
							size="sm"
							color="gray"
						>
							max
						</Button>
					</div>
					<div>
						<p className={`text-sm mb-2 ${Number(inputValue) === maxToUnlock && `line-through`}`}>
							Choose a period to lock the remaining $PARAS
						</p>
						<div className="w-full flex items-center space-x-2">
							<button
								disabled={Number(inputValue) === maxToUnlock}
								onClick={() =>
									onClickDuration(process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? 30 : 3)
								}
								className={clsx(
									`border rounded-lg p-1 px-2 text-white text-xs transition-all`,
									(duration === 30 || duration === 3) && `bg-blueButton hover:bg-blue-600`,
									Number(inputValue) === maxToUnlock &&
										`border-gray-400 bg-gray-400 cursor-default`,
									Number(inputValue) !== maxToUnlock && `border-blueButton cursor-pointer`
								)}
							>
								{process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? '30 Days' : '3 Minutes'}
							</button>
							<button
								disabled={Number(inputValue) === maxToUnlock}
								onClick={() =>
									onClickDuration(process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? 90 : 9)
								}
								className={clsx(
									`border rounded-lg p-1 px-2 text-white text-xs translate-all`,
									(duration === 90 || duration === 9) && `bg-blueButton hover:bg-blue-600`,
									Number(inputValue) === maxToUnlock &&
										`border-gray-400 bg-gray-400 cursor-default`,
									Number(inputValue) !== maxToUnlock && `border-blueButton cursor-pointer`
								)}
							>
								{process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? '90 Days' : '9 Minutes'}
							</button>
						</div>
					</div>
				</div>
				<div className="flex w-full items-center">
					<Button
						isLoading={isSubmitting}
						isDisabled={isDisabledUnlockStakeButton()}
						onClick={onUnlockStake}
						isFullWidth
						size="lg"
						color="blue-gray"
						className="mt-4"
					>
						Unlock Stake
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UnlockedStakeTokenModal
