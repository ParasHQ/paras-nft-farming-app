import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount, parseParasAmount, prettyBalance } from 'utils/common'

interface StakeModalProps {
	seedId: string
	title: string
	show: boolean
	onClose: () => void
}

const StakeModal = (props: StakeModalProps) => {
	const [balance, setBalance] = useState('0')
	const [inputStake, setInputStake] = useState<number | string>('')

	useEffect(() => {
		if (props.show) {
			getParasBalance()
		}
	}, [props.show])

	const getParasBalance = async () => {
		const balanceParas = await near.nearViewFunction({
			methodName: 'ft_balance_of',
			contractName: CONTRACT.TOKEN,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setBalance(balanceParas)
	}

	const stakeToken = async () => {
		await near.nearFunctionCall({
			methodName: 'ft_transfer_call',
			contractName: CONTRACT.TOKEN,
			args: {
				receiver_id: CONTRACT.FARM,
				amount: parseParasAmount(inputStake),
				msg: JSON.stringify({
					transfer_type: 'seed',
					seed_id: props.seedId,
				}),
			},
			amount: '1',
			gas: GAS_FEE[300],
		})
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5 cursor-pointer" onClick={props.onClose}>
						<IconBack />
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Stake</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5" />
				</div>
				<div className="mb-8">
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
				<Button onClick={stakeToken} isFullWidth size="lg">
					Stake
				</Button>
			</div>
		</Modal>
	)
}

export default StakeModal
