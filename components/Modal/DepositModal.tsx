import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import { useNearProvider } from 'hooks/useNearProvider'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import near, { CONTRACT } from 'services/near'

interface DepositModalProps {
	show: boolean
	onClose: () => void
}

const DepositModal = ({ show, onClose }: DepositModalProps) => {
	const { accountId } = useNearProvider()

	const onClickDeposit = () => {
		near.nearFunctionCall({
			contractName: CONTRACT.FARM,
			methodName: 'storage_deposit',
			amount: '18520000000000000000000',
			args: {
				account_id: accountId,
			},
		})
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md mx-4 md:m-auto max-w-sm">
				<p>
					In order to Stake Paras you need to deposit {formatNearAmount('18520000000000000000000')}{' '}
					NEAR for storage
				</p>
				<div className="flex justify-between items-center mt-4">
					<Button onClick={onClickDeposit}>Deposit</Button>
				</div>
			</div>
		</Modal>
	)
}

export default DepositModal
