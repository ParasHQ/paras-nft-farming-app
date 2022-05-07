import { useEffect, useState } from 'react'
import Button from 'components/Common/Button'
import { formatParasAmount, prettyBalance } from 'utils/common'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import near, { CONTRACT, getAmount } from 'services/near'
import { GAS_FEE } from 'constants/gasFee'
import Modal from 'components/Common/Modal'
import { IUserVote } from 'interfaces/proposal'

interface IProposalVoteProps {
	options: string[]
	delegationBalance: number
	id: string
	userVotes: IUserVote | undefined
}

const ProposalVote = ({ options, delegationBalance, id, userVotes }: IProposalVoteProps) => {
	const [choosenVote, setChoosenVote] = useState<string>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [showError, setShowError] = useState<null | 'option' | 'no-power'>(null)
	const cursorStatus = userVotes ? 'cursor-not-allowed' : 'cursor-pointer'

	useEffect(() => {
		if (userVotes) {
			setChoosenVote(userVotes.vote_option)
		}
	}, [])

	useEffect(() => {
		if (choosenVote) {
			setShowError(null)
		}
	}, [choosenVote])

	const onClickVote = () => {
		if (!choosenVote) {
			setShowError('option')
			return
		}

		if (delegationBalance === 0) {
			setShowError('no-power')
			return
		}

		setShowConfirmModal(true)
	}

	const handleVote = async () => {
		setIsSubmitting(true)

		try {
			const txs: {
				receiverId: string
				functionCalls: FunctionCallOptions[]
			}[] = []

			txs.push({
				receiverId: CONTRACT.DAO,
				functionCalls: [
					{
						methodName: 'act_proposal',
						contractId: CONTRACT.DAO,
						args: {
							id: parseInt(id),
							action: { Vote: { vote_option: choosenVote } },
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
		<>
			<Modal isShow={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
				<div className="max-w-sm w-full bg-parasGrey rounded-lg m-6 md:m-auto shadow-xl p-4 overflow-hidden">
					<p className="mb-2 font-bold">Are you sure to vote for this proposal?</p>
					<p className="text-sm font-light">
						After you vote, you won't be able to unvote or change your vote.
					</p>
					<div className="float-right flex gap-1 mt-4">
						<Button onClick={() => setShowConfirmModal(false)} className="w-20" color="">
							Cancel
						</Button>
						<Button onClick={handleVote} isLoading={isSubmitting} className="w-20">
							Confirm
						</Button>
					</div>
				</div>
			</Modal>

			<div className="text-white p-4 rounded-md shadow-xl bg-parasGrey mt-4">
				<p className="text-xl font-bold mb-2 text-center">Vote</p>

				<div className="overflow-hidden rounded-xl divide-y divide-gray-700">
					{options.sort().map((option) => (
						<div
							key={option}
							className={`${
								option === choosenVote ? 'bg-blueButton' : 'bg-[#212737]'
							} flex px-4 ${cursorStatus} transition duration-200`}
							onClick={() => !userVotes && setChoosenVote(option)}
						>
							<input
								className={`${cursorStatus} rounded-full h-4 w-4 bg-white checked:bg-blue-600 checked:border-white focus:outline-none transition duration-200 my-auto mr-2`}
								type="radio"
								name="voting-proposal"
								value={option}
								onChange={() => !userVotes && setChoosenVote(option)}
								checked={option === choosenVote}
								id={option}
							/>
							<label
								className={`${cursorStatus} py-4 inline-block text-white flex-1`}
								htmlFor={option}
							>
								{option}
							</label>
						</div>
					))}
				</div>
				{showError === 'option' && (
					<p className="text-sm text-red-500 mt-1">*Please choose an option</p>
				)}
				{showError === 'no-power' && (
					<p className="text-sm text-red-500 mt-1">You don't have voting power</p>
				)}
				<div className="mt-6 flex justify-between items-end">
					<div>
						<p className="text-lg text-white text-opacity-80">
							Your voting power:{' '}
							<span className="text-white text-opacity-100 font-bold">
								{prettyBalance(formatParasAmount(delegationBalance), 0)} PARAS
							</span>
						</p>
						<p className="font-light text-white text-opacity-80 text-sm">
							Voting power are added from your staked PARAS
						</p>
					</div>
					<div>
						<Button
							onClick={onClickVote}
							className="px-10 w-32"
							size="md"
							isLoading={isSubmitting}
							isDisabled={userVotes !== undefined}
						>
							{userVotes !== undefined ? 'Voted' : 'Vote'}
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}

export default ProposalVote
