import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { ModalCommonProps } from 'interfaces/modal'
import { useCallback, useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount, parseParasAmount, prettyBalance } from 'utils/common'

interface UnstakeTokenModalProps extends ModalCommonProps {
	claimableRewards: {
		[key: string]: string
	}
}

const UnstakeTokenModal = (props: UnstakeTokenModalProps) => {
	const [balance, setBalance] = useState('0')
	const [inputUnstake, setInputUnstake] = useState<number | string>('')

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

	useEffect(() => {
		if (props.show) {
			getStakedBalance()
		}
	}, [props.show, getStakedBalance])

	const unstakeToken = async () => {
		await near.nearFunctionCall({
			methodName: 'withdraw_seed',
			contractName: CONTRACT.FARM,
			args: {
				seed_id: props.seedId,
				amount: parseParasAmount(inputUnstake),
			},
			amount: '1',
			gas: GAS_FEE[100],
		})
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
						Balance: {prettyBalance(balance)}
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							value={inputUnstake}
							onChange={(event) => setInputUnstake(event.target.value)}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					<div className="text-left">
						<Button
							onClick={() => balance && setInputUnstake(formatParasAmount(balance))}
							className="float-none mt-2 w-16"
							isDisabled={!balance}
							size="sm"
							color="gray"
						>
							use max
						</Button>
					</div>
				</div>
				<div className="text-center">
					<p className="font-semibold text-sm mt-2">
						Unstaking will automatically claim your rewards:
					</p>
					{Object.keys(props.claimableRewards).map((k) => {
						return (
							<div className="text-sm">
								<PoolReward key={k} contractName={k} amount={props.claimableRewards[k]} />
							</div>
						)
					})}
				</div>
				<Button
					isDisabled={inputUnstake === ''}
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
