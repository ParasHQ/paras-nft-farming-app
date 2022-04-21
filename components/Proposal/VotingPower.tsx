import Button from 'components/Common/Button'
import DelegateTokenModal from 'components/Modal/DelegateModal'
import UndelegateTokenModal from 'components/Modal/UndelegateModal'
import { useNearProvider } from 'hooks/useNearProvider'
import { TShowModal } from 'pages/proposal/[id]'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount, prettyBalance } from 'utils/common'

interface IVotingPowerProps {
	className?: string
}

const VotingPower = ({ className = '' }: IVotingPowerProps) => {
	const [delegationBalance, setDelegationBalance] = useState<number>(0)
	const [hasRegister, setHasRegister] = useState(false)
	const [showModal, setShowModal] = useState<TShowModal>(null)
	const { accountId } = useNearProvider()

	useEffect(() => {
		const getDelegation = async () => {
			try {
				const delegationBalance = await near.nearViewFunction({
					contractName: CONTRACT.DAO,
					methodName: 'delegation_balance_of',
					args: {
						account_id: accountId,
					},
				})
				setDelegationBalance(delegationBalance)
				setHasRegister(true)
			} catch (error) {
				console.log(error)
			}
		}

		if (accountId) {
			getDelegation()
		}
	}, [accountId])

	return (
		<div className={className}>
			<DelegateTokenModal
				show={showModal === 'delegate'}
				onClose={() => setShowModal(null)}
				hasRegister={hasRegister}
				delegationBalance={delegationBalance}
			/>
			<UndelegateTokenModal
				show={showModal === 'undelegate'}
				onClose={() => setShowModal(null)}
				delegationBalance={delegationBalance}
			/>
			<div className="mt-4 max-w-3xl mx-auto">
				<div className="flex justify-between mb-4">
					<div className="text-lg text-white text-opacity-80">
						Your voting power:{' '}
						<span className="font-bold text-white text-opacity-100">
							{prettyBalance(formatParasAmount(delegationBalance), 0)} PARAS
						</span>
					</div>
					<div className="flex gap-2">
						<div>
							<Button onClick={() => setShowModal('delegate')} className="px-6 w-28" size="md">
								Add
							</Button>
						</div>
						<div>
							<Button
								onClick={() => setShowModal('undelegate')}
								className="px-6 w-28"
								size="md"
								color="blue-gray"
							>
								Remove
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default VotingPower
