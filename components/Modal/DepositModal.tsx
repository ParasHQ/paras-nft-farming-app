import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import { useNearProvider } from 'hooks/useNearProvider'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import near, { CONTRACT } from 'services/near'

interface DepositModalProps {
	show: boolean
	onClose: () => void
}

const DepositModal = ({ show, onClose }: DepositModalProps) => {
	const { accountId } = useNearProvider()

	const onClickDeposit = () => {
		if (accountId) {
			near.nearFunctionCall({
				contractName: CONTRACT.FARM,
				methodName: 'storage_deposit',
				amount: parseNearAmount('0.1') as string,
				args: {
					account_id: accountId,
				},
			})
		}
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md mx-4 md:m-auto max-w-sm">
				<p>In order to Stake Paras, you need to deposit 0.1 NEAR for storage</p>

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
