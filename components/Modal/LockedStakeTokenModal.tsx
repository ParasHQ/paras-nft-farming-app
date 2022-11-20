import InputDropdown from 'components/Common/InputDropdown'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { IDataInputDropdown } from 'interfaces'
import { ModalCommonProps } from 'interfaces/modal'
import React, { useEffect, useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import { currentMemberLevel, parseParasAmount, prettyBalance } from 'utils/common'
import Slider from 'rc-slider'
import InputText from 'components/Common/InputText'
import Button from 'components/Common/Button'
import ReactTooltip from 'react-tooltip'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { GAS_FEE } from 'constants/gasFee'
import { A_DAY_IN_SECONDS } from 'constants/time'
import { GOLD, PLATINUM, SILVER } from 'constants/royaltyLevel'
import clsx from 'clsx'
import { trackStakingLockedParas, trackStakingTopupParas } from 'lib/ga'
import { useWalletSelector } from 'contexts/WalletSelectorContext'

interface LockedStakeModalProps extends ModalCommonProps {
	userStaked: string
	isTopup: boolean
	lockedBalance: number
	isWithinDuration: boolean
	lockedDuration: number
	claimableRewards: {
		[key: string]: string
	}
}

const LockedStakeTokenModal = (props: LockedStakeModalProps) => {
	const { accountId } = useWalletSelector()
	const [max, setMax] = useState<number>(0)
	const [min, setMin] = useState<number>(0)
	const [inputValue, setInputValue] = useState<string>('')
	const [duration, setDuration] = useState<number>(0)
	const [agreement, setAgreement] = useState<boolean>(false)
	const [availableBalanceData, setAvailableBalanceData] = useState<IDataInputDropdown[]>([])
	const [stakedBalance, setStakedBalance] = useState<number>(0)
	const [flexibleBalance, setFlexibleBalance] = useState<number>(0)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [rerenderingSlider, setRerenderingSlider] = useState(false)
	const [selectedBalance, setSelectedBalance] = useState<IDataInputDropdown>({
		id: 'staked_balance',
		label: `Staked PARAS: ${prettyBalance(props.userStaked, 18)} Ⓟ`,
	})

	const fetchSourceBalance = async (_stakedBalance: number) => {
		const _flexibleBalance = await near.nearViewFunction({
			methodName: 'ft_balance_of',
			contractName: CONTRACT.TOKEN,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setFlexibleBalance(Math.floor((Number(_flexibleBalance) / 10 ** 18) * 100) / 100)
		setStakedBalance(Math.floor((Number(_stakedBalance) / 10 ** 18) * 100) / 100)
		const availableBalanceParas: IDataInputDropdown[] = [
			{
				id: 'staked_balance',
				label: `Staked PARAS: ${prettyBalance(`${_stakedBalance}`, 18)} Ⓟ`,
			},
			{
				id: 'flexible_balance',
				label: `Balance: ${prettyBalance(_flexibleBalance, 18)} Ⓟ`,
			},
		]
		setAvailableBalanceData(availableBalanceParas)
	}

	const setDefaultMax = () => {
		if (props.userStaked && props.lockedBalance) {
			setMax(((Number(props.userStaked) / 10 ** 18) * 100) / 100)
		}
	}

	const setDefaultMin = () => {
		setMin(0)
	}

	const getTotalLocked = () => {
		if (props.isTopup) {
			if (inputValue)
				return Math.floor((props.lockedBalance / 10 ** 18) * 100) / 100 + Number(inputValue)
			else return 0
		} else {
			if (inputValue) return Number(inputValue)
			else return 0
		}
	}

	const setAddMorePARASText = (input: number) => {
		let nominal = 0
		let level = ''
		if (input < 3000) {
			if (input < SILVER) {
				nominal = Number((SILVER - input).toFixed(2))
				level = 'Silver'
			} else if (input >= SILVER && input < GOLD) {
				nominal = Number((GOLD - input).toFixed(2))
				level = 'Gold'
			} else if (input >= GOLD && input < PLATINUM) {
				nominal = Number((PLATINUM - input).toFixed(2))
				level = 'Platinum'
			}
			return `Add ${nominal} $PARAS or more to be ${level} Member`
		}
		return ``
	}

	const isDisabledLockStakeButton = () =>
		Number(inputValue) > max ||
		!inputValue ||
		Number(inputValue) === 0 ||
		Number(inputValue) < min ||
		duration <= 0 ||
		!agreement

	const isDisabled30Days = () => {
		if (process.env.NEXT_PUBLIC_APP_ENV === 'mainnet') {
			return props.isTopup && props.lockedDuration && props.lockedDuration === 90
		} else {
			return props.isTopup && props.lockedDuration && props.lockedDuration === 9
		}
	}

	const onChangeInput = (value: string | number) => {
		setInputValue(value.toString().replace(/^[^1-9][^.]/g, ''))
	}

	const onChangeMaxInput = () => {
		setInputValue(`${max}`)
	}

	const onClickDuration = (_duration: number) => {
		setDuration(_duration)
	}

	const onLockStake = async () => {
		const parseDuration: number = duration * A_DAY_IN_SECONDS
		const parseDurationTestnet: number = duration * 60
		const finalAmountValue = inputValue
		if (props.isTopup) {
			trackStakingTopupParas(finalAmountValue, accountId)
		} else {
			trackStakingLockedParas(finalAmountValue, accountId)
		}
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
			if (selectedBalance.id === 'flexible_balance') {
				txs.push({
					receiverId: CONTRACT.TOKEN,
					functionCalls: [
						{
							methodName: 'ft_transfer_call',
							contractId: CONTRACT.TOKEN,
							args: {
								receiver_id: CONTRACT.FARM,
								amount: parseParasAmount(finalAmountValue),
								msg: '',
							},
							attachedDeposit: getAmount('1'),
							gas: getAmount(GAS_FEE[200]),
						},
					],
				})
			}
			txs.push({
				receiverId: CONTRACT.FARM,
				functionCalls: [
					{
						methodName: 'lock_ft_balance',
						contractId: CONTRACT.FARM,
						args: {
							seed_id: CONTRACT.TOKEN,
							amount: parseParasAmount(finalAmountValue),
							duration:
								process.env.NEXT_PUBLIC_APP_ENV === 'mainnet'
									? parseDuration
									: parseDurationTestnet,
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

	useEffect(() => {
		if (accountId) {
			fetchSourceBalance(Number(props.userStaked))
			setDefaultMax()
			setDefaultMin()
		}
	}, [props.userStaked])

	useEffect(() => {
		setRerenderingSlider(true)
		setInputValue(`${0.0}`)
		if (selectedBalance.id === 'staked_balance') {
			setMax(stakedBalance)
		} else {
			setMax(flexibleBalance)
		}
		setTimeout(() => {
			setRerenderingSlider(false)
		}, 50)
	}, [selectedBalance, props.show, props.isTopup])

	return (
		<Modal isShow={props.show} onClose={props.onClose} closeOnEscape={false} closeOnBgClick={false}>
			<ReactTooltip html={true} />
			<div className="max-w-md w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Locked Stake</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5" />
				</div>

				{props.isTopup && (
					<div className="mb-6 flex items-center justify-center w-full">
						<div className="w-10/12 flex items-center bg-yellowWarning rounded-lg text-black text-sm p-2">
							<div className="w-2/12 flex items-center justify-center">
								<img src="/warning.png" className="object-contain w-7 h-7" alt="" />
							</div>
							<div className="w-10/12 flex items-center justify-center">
								<p>By updating $PARAS, your period time will be reset</p>
							</div>
						</div>
					</div>
				)}

				<div className="mb-4">
					<div className="flex items-center justify-end w-full">
						<InputDropdown
							fullWidth={true}
							defaultValue={selectedBalance.label}
							selectItem={setSelectedBalance}
							data={availableBalanceData}
						/>
					</div>
				</div>

				<div className="mb-4">
					<p className="text-sm">
						<span>Current Member: </span>
						<span className="font-semibold">{currentMemberLevel(getTotalLocked())}</span>
					</p>
					{props.isTopup && (
						<p className="text-sm mb-2">
							<span>Current Locked Stake: </span>
							<span className="font-semibold">{prettyBalance(`${props.lockedBalance}`, 18)} Ⓟ</span>
						</p>
					)}
					<div className="flex items-center w-full">
						{!rerenderingSlider && (
							<Slider
								value={Number(inputValue)}
								min={0}
								step={0.01}
								max={max}
								onChange={(value) => {
									onChangeInput(value as number)
								}}
								railStyle={{
									backgroundColor: `#35405E`,
									height: `0.4rem`,
								}}
								trackStyle={{
									backgroundColor: `#247DFE`,
									height: `0.4rem`,
								}}
								handleStyle={{
									backgroundColor: `#247DFE`,
									borderColor: `#247DFE`,
								}}
							/>
						)}
					</div>
				</div>

				<div className="mb-4">
					<div className="flex w-full flex-wrap items-center">
						<div className="w-full md:w-7/12 flex flex-col relative mb-3 md:mb-0">
							<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
								<InputText
									disabled={max === 0}
									value={inputValue}
									onChange={(event) => onChangeInput(event.target.value)}
									className="border-none"
									type="number"
									placeholder="0.0"
									prefixMax={true}
								/>
								<p className="text-white font-bold mr-3 shado">PARAS</p>
							</div>
							<div className="absolute left-1 top-2">
								<Button
									isDisabled={max === 0}
									onClick={onChangeMaxInput}
									className="float-none p-1 px-2 text-xs"
									size="sm"
									color="gray"
								>
									max
								</Button>
							</div>
						</div>
						<div className="w-full md:w-5/12 flex justify-center md:justify-evenly items-center">
							<button
								disabled={isDisabled30Days() as boolean}
								onClick={() =>
									onClickDuration(process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? 30 : 3)
								}
								className={clsx(
									`border rounded-lg mx-1 p-1 px-2 text-white text-xs`,
									(duration === 30 || duration === 3) && `bg-blueButton hover:bg-blue-600`,
									isDisabled30Days() && `border-gray-400 bg-gray-400 cursor-default`,
									!isDisabled30Days() && `border-blueButton cursor-pointer`
								)}
							>
								{process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? '30 Days' : '3 Minutes'}
							</button>
							<button
								onClick={() =>
									onClickDuration(process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? 90 : 9)
								}
								className={clsx(
									`border border-blueButton rounded-lg mx-1 p-1 px-2 text-white text-xs transition-all`,
									(duration === 90 || duration === 9) && `bg-blueButton hover:bg-blue-600`
								)}
							>
								{process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? '90 Days' : '9 Minutes'}
							</button>
						</div>
					</div>
					<div>
						<p
							className={`text-redButton text-sm ${
								Number(inputValue) > max ? `visible` : `invisible`
							}`}
						>
							Not enough $PARAS
						</p>
					</div>
				</div>
				<div className="mb-1 flex justify-between items-center">
					<div>
						<p className="text-sm font-semibold">Total Locked Staking:</p>
					</div>
					<div>
						<p>{getTotalLocked().toFixed(2)} Ⓟ</p>
					</div>
				</div>
				<div className="mb-4">
					<div>
						<p className="text-blueButton text-sm">{setAddMorePARASText(getTotalLocked())}</p>
					</div>
				</div>

				<div className="mb-4">
					<div className="flex items-center">
						<input
							type="checkbox"
							className="mr-4"
							onChange={(e) => {
								setAgreement(e.target.checked)
							}}
						/>
						<p className="text-sm">
							I have read and agree to the loyalty program{' '}
							<span className="underline hover:font-semibold cursor-pointer transition-all">
								<a
									href="https://guide.paras.id/terms-and-conditions/loyalty-program"
									target={`_blank`}
								>
									Terms & Conditions
								</a>
							</span>
							*
						</p>
					</div>
				</div>

				<div className="flex w-full items-center">
					<Button
						isDisabled={isDisabledLockStakeButton()}
						isFullWidth
						onClick={onLockStake}
						isLoading={isSubmitting}
						className="mt-4"
						size="lg"
					>
						Lock Stake
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default LockedStakeTokenModal
