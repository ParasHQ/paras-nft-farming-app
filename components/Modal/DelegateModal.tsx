import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import JSBI from 'jsbi'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useEffect, useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import { formatParasAmount, parseParasAmount, prettyBalance } from 'utils/common'

interface DelegateTokenModalProps {
	show: boolean
	onClose: () => void
	hasRegister: boolean
	delegationBalance: number
}

const DelegateTokenModal = (props: DelegateTokenModalProps) => {
	const [balance, setBalance] = useState('0')
	const [inputDelegate, setInputDelegate] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const availableForDelegate = JSBI.subtract(
		JSBI.BigInt(balance),
		JSBI.BigInt(props.delegationBalance)
	).toString()

	useEffect(() => {
		if (props.show) {
			getStakedBalance()
		}
	}, [props.show])

	const getStakedBalance = async () => {
		const balanceStaked = await near.nearViewFunction({
			methodName: 'list_user_seeds',
			contractName: CONTRACT.FARM,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setBalance(balanceStaked[CONTRACT.TOKEN])
	}

	const delegateToken = async () => {
		setIsSubmitting(true)

		try {
			const txs: {
				receiverId: string
				functionCalls: FunctionCallOptions[]
			}[] = []

			if (!props.hasRegister) {
				txs.push({
					receiverId: CONTRACT.FARM,
					functionCalls: [
						{
							methodName: 'register_delegation',
							contractId: CONTRACT.FARM,
							args: {},
							attachedDeposit: getAmount(parseNearAmount('0.00016')),
							gas: getAmount(GAS_FEE[200]),
						},
					],
				})
			}

			txs.push({
				receiverId: CONTRACT.FARM,
				functionCalls: [
					{
						methodName: 'delegate_seed',
						contractId: CONTRACT.FARM,
						args: {
							amount: parseParasAmount(inputDelegate),
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
						<p className="font-bold text-xl text-white">Add</p>
						<p className="text-white text-sm -mt-1">DAO Contract</p>
					</div>
					<div className="w-1/5" />
				</div>

				<div>
					<div className="opacity-80 text-white text-sm flex justify-between">
						<p>Staked Paras:</p>
						<p>{prettyBalance(balance)}</p>
					</div>
					<div className="opacity-80 text-white text-sm mb-2 flex justify-between">
						<p>Available for Add:</p>
						<p>{prettyBalance(availableForDelegate)}</p>
					</div>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputDelegate}
							onChange={(event) => setInputDelegate(event.target.value)}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					<div className="text-left">
						<Button
							onClick={() => setInputDelegate(formatParasAmount(availableForDelegate))}
							className="float-none mt-2 w-16"
							size="sm"
							color="gray"
						>
							use max
						</Button>
					</div>
					<div className="p-3 rounded-md bg-blueButton bg-opacity-25 mt-4 ">
						<p className="text-white text-xs text-center font-medium">
							Please note if you add PARAS, you won't be able to unstake your added PARAS
							immediately
						</p>
					</div>
				</div>
				<Button
					isLoading={isSubmitting}
					isDisabled={inputDelegate === '' || isSubmitting}
					onClick={delegateToken}
					isFullWidth
					size="lg"
					className="mt-4"
				>
					Deposit
				</Button>
			</div>
		</Modal>
	)
}

export default DelegateTokenModal
