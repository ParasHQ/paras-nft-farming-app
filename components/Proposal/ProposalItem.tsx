import IconClock from 'components/Icon/IconClock'
import { IProposal, IVotes } from 'interfaces/proposal'
import Link from 'next/link'
import { useNearProvider } from 'hooks/useNearProvider'
import { getTimeRemaining, prettyBalance } from 'utils/common'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

const ProposalItem = ({ data: proposalData }: { data: IProposal }) => {
	const [data, setData] = useState(proposalData)

	const { accountId } = useNearProvider()
	const userVotes = data.proposal.votes?.[accountId || '']

	const startTime = new Date((data.proposal.proposal_start_time || 0) / 10 ** 6)
	const endTime = new Date(startTime.getTime() + (data.proposal.proposal_period || 0) / 10 ** 6)
	const proposalInProgress = data.proposal.status === 'InProgress' && endTime.getTime() > Date.now()

	const { hours, days } = getTimeRemaining(endTime.getTime())

	useEffect(() => {
		const fetchVotes = async () => {
			const proposalVotesWrap: IVotes = {}
			if (accountId) {
				const proposalVoteUser = await near.nearViewFunction({
					contractName: CONTRACT.DAO,
					methodName: 'get_proposal_vote',
					args: {
						id: proposalData.id,
						account_id: accountId,
					},
				})

				if (proposalVoteUser) proposalVotesWrap[accountId as string] = proposalVoteUser
			}

			setData((prev) => ({
				...prev,
				proposal: {
					...prev.proposal,
					votes: proposalVotesWrap,
				},
			}))
		}

		if (accountId) {
			fetchVotes()
		}
	}, [accountId, proposalData.id])

	const importantText = () => {
		const isNotStarted = startTime.getTime() > Date.now()
		const isEnded = endTime.getTime() < Date.now()

		if (data.proposal.status === 'InProgress' && !isEnded) {
			if (isNotStarted) {
				return 'Coming Soon'
			} else {
				return userVotes ? `You voted ${userVotes.vote_option}` : 'You have not voted'
			}
		} else if (data.proposal.status.Finalized) {
			const winnerOption = data.proposal.status.Finalized.vote_option_winner
			const parasCountWinner = data.proposal.vote_counts[winnerOption]
			return (
				<>
					<p>Results:</p>
					<p>{`${winnerOption} - ${prettyBalance(parasCountWinner)} PARAS`}</p>
				</>
			)
		} else if (data.proposal.status === 'Approved') {
			return 'Approved'
		} else if (data.proposal.status === 'Rejected') {
			return 'Rejected'
		} else {
			return 'Ended'
		}
	}

	return (
		<Link href={`/proposal/${data.id}`}>
			<a>
				<div className="text-white p-6 rounded-xl shadow-xl bg-parasGrey relative mb-6 cursor-pointer">
					<p className="font-bold text-2xl">{data.proposal.title}</p>
					<p className="truncate">by {data.proposal.proposer}</p>
					<p className="my-6 text-white text-opacity-80">{data.proposal.description}</p>
					<div className="md:flex flex-row-reverse justify-between items-end">
						<div className="mb-2 md:mb-0 flex items-center gap-2">
							{startTime.getTime() < Date.now() && (
								<>
									<IconClock color={proposalInProgress ? '#4FA59E' : '#ffffff'} />
									<p className={`${proposalInProgress ? 'text-[#4FA59E]' : ''}`}>
										{proposalInProgress ? `${days}D ${hours}H Remaining` : `Ended`}
									</p>
								</>
							)}
						</div>
						<div className="italic font-bold text-blueButton">{importantText()}</div>
					</div>
				</div>
			</a>
		</Link>
	)
}

export default ProposalItem
