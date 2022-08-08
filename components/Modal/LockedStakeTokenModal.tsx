import InputDropdown from 'components/Common/InputDropdown'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { IDataInputDropdown } from 'interfaces'
import { ModalCommonProps } from 'interfaces/modal'
import React, { useEffect, useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import { parseParasAmount, prettyBalance } from 'utils/common'
import Slider from 'rc-slider'
import InputText from 'components/Common/InputText'
import Button from 'components/Common/Button'
import ReactTooltip from 'react-tooltip'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { A_DAY_IN_SECONDS } from 'constants/time'

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
	const { accountId } = useNearProvider()
	const [memberLevel, setMemberLevel] = useState<string>('Bronze')
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
			if (input < 1000) {
				nominal = Number((1000 - input).toFixed(2))
				level = 'Silver'
			} else if (input >= 1000 && input < 2000) {
				nominal = Number((2000 - input).toFixed(2))
				level = 'Gold'
			} else if (input >= 2000 && input < 3000) {
				nominal = Number((3000 - input).toFixed(2))
				level = 'Platinum'
			}
			return `Add ${nominal} $PARAS or more to be ${level} Member`
		}
		return ``
	}

	const setCurrentMemberLevel = (value: number) => {
		if (value < 1000) {
			setMemberLevel('Bronze')
		} else if (value >= 1000 && value < 2000) {
			setMemberLevel('Silver')
		} else if (value >= 2000 && value < 3000) {
			setMemberLevel('Gold')
		} else if (value >= 3000) {
			setMemberLevel('Platinum')
		}
	}

	const isDisabledLockStakeButton = () =>
		Number(inputValue) > max ||
		!inputValue ||
		Number(inputValue) === 0 ||
		Number(inputValue) < min ||
		duration <= 0 ||
		!agreement

	const isDisabled30Days = () =>
		props.isTopup && props.lockedDuration ? props.lockedDuration === 90 : false

	const onChangeSlider = (value: number) => {
		setCurrentMemberLevel(getTotalLocked())
		setInputValue(`${value}`)
	}

	const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentMemberLevel(getTotalLocked())
		setInputValue(event.target.value.replace(/^[^1-9][^.]/g, ''))
	}

	const onChangeMaxInput = () => {
		setCurrentMemberLevel(getTotalLocked())
		setInputValue(`${max}`)
	}

	const onClickDuration = (_duration: number) => {
		setDuration(_duration)
	}

	const onLockStake = async () => {
		const parseDuration: number = duration * A_DAY_IN_SECONDS
		const finalAmountValue = inputValue
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
							duration: parseDuration,
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
			setCurrentMemberLevel(Math.floor(props.lockedBalance / 10 ** 18))
		}
	}, [props.lockedBalance, props.userStaked])

	useEffect(() => {
		setRerenderingSlider(true)
		setInputValue(`${0.0}`)
		if (props.isTopup && !props.isTopup) {
			setMemberLevel(`Bronze`)
		}
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
								<p>
									{' '}
									<p>
										By updating $PARAS, your period time will be reset and your reward will be
										automatically collected{' '}
									</p>
								</p>
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
						Current Member: <span className="font-semibold">{memberLevel}</span>
					</p>
					{props.isTopup && (
						<p className="text-sm mb-2">
							Current Locked Stake:{' '}
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
									onChangeSlider(value as number)
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
									onChange={(event) => onChangeInput(event)}
									className="border-none"
									type="number"
									placeholder="0.0"
									prefixMax={true}
								/>
								<p className="text-white font-bold mr-3 shado">PARAS</p>
							</div>
							{Number(inputValue) > max && (
								<div>
									<p className="text-redButton text-sm">Not enough $PARAS</p>
								</div>
							)}
							{props.isTopup && Number(inputValue) < min && (
								<div>
									<p className="text-redButton text-sm">$PARAS can't be lower than before</p>
								</div>
							)}
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
								disabled={isDisabled30Days()}
								onClick={() => onClickDuration(30)}
								className={`border rounded-lg p-1 px-2 text-white text-sm ${
									duration === 30 && `bg-blueButton`
								} ${
									isDisabled30Days()
										? `border-gray-400 bg-gray-400 cursor-default`
										: `border-blueButton cursor-pointer`
								}`}
							>
								30 Days
							</button>
							<button
								onClick={() => onClickDuration(90)}
								className={`border border-blueButton rounded-lg p-1 px-2 text-white text-sm transition-all ${
									duration === 90 && `bg-blueButton hover:bg-blue-600`
								}`}
							>
								90 Days
							</button>
						</div>
					</div>
				</div>
				<div className="mb-1 flex justify-between items-center">
					<div>
						<p className="text-sm font-semibold">Total Locked Staking:</p>
					</div>
					<div>
						<p>{getTotalLocked()} Ⓟ</p>
					</div>
				</div>
				<div className="mb-6">
					{props.isTopup && (
						<div>
							<p className="text-blueButton text-sm">{setAddMorePARASText(getTotalLocked())}</p>
						</div>
					)}
				</div>

				<div className="mb-6">
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
								<a href="https://guide.paras.id/terms-and-condition/marketplace" target={`_blank`}>
									term & conditions
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
