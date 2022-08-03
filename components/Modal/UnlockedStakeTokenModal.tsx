import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { ModalCommonProps } from 'interfaces/modal'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import React, { useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import { parseParasAmount, prettyBalance } from 'utils/common'

interface UnlockedStakeModalProps extends ModalCommonProps {
	userStaked: string
	isTopup: boolean
	lockedBalance: number
	isWithinDuration: boolean
	claimableRewards: {
		[key: string]: string
	}
}

const UnlockedStakeTokenModal = (props: UnlockedStakeModalProps) => {
	const { accountId } = useNearProvider()
	const [inputValue, setInputValue] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const maxToUnlock = props.lockedBalance / 10 ** 18

	const isDisabledUnlockStakeButton = () =>
		Number(inputValue) > maxToUnlock || !inputValue || Number(inputValue) === 0

	const onUnlockStake = async () => {
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
					<p className="opacity-80 text-right text-white text-sm mb-1">
						Locked Staking: {prettyBalance(`${props.lockedBalance}`, 18)} Ⓟ
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputValue}
							onChange={(event) => setInputValue(event.target.value.replace(/^[^1-9][^.]/g, ''))}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					{Number(inputValue) > maxToUnlock && (
						<div>
							<p className="text-redButton text-sm">Not enough $PARAS</p>
						</div>
					)}
					<div className="text-left">
						<Button
							onClick={() => setInputValue(`${maxToUnlock}`)}
							className="float-none mt-2 w-16 border border-blueButton"
							size="sm"
							color="gray"
						>
							max
						</Button>
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
