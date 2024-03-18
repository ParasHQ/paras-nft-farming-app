import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import { GAS_FEE } from 'constants/gasFee'
import { useWalletSelector } from 'contexts/WalletSelectorContext'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { CONTRACT } from 'utils/contract'

interface DepositModalProps {
	show: boolean
	onClose: () => void
}

const DepositModal = ({ show, onClose }: DepositModalProps) => {
	const { accountId, signAndSendTransaction } = useWalletSelector()

	const onClickDeposit = async () => {
		if (accountId) {
			await signAndSendTransaction({
				receiverId: CONTRACT.FARM,
				actions: [
					{
						type: 'FunctionCall',
						params: {
							methodName: 'storage_deposit',
							args: {
								account_id: accountId,
							},
							deposit: parseNearAmount('0.01852') || '',
							gas: GAS_FEE[30],
						},
					},
				],
				signerId: accountId,
			})
		}
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md mx-4 md:m-auto max-w-sm">
				<p>In order to Stake Paras, you need to deposit 0.01852 NEAR for storage</p>

				<div className="flex justify-between items-center mt-4">
					<Button className="px-4" onClick={onClickDeposit}>
						Deposit
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default DepositModal
