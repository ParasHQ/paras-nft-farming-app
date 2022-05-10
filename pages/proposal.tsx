import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import IconClock from 'components/Icon/IconClock'
import { IProposal, IVotes } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import Link from 'next/link'
import { useNearProvider } from 'hooks/useNearProvider'
import { formatParasAmount, getTimeRemaining, prettyBalance } from 'utils/common'
import VotingPower from 'components/Proposal/VotingPower'
import ProposalLoader from 'components/Loader/ProposalLoader'

const Proposal = () => {
	const [proposals, setProposals] = useState<IProposal[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const { isInit, accountId } = useNearProvider()

	useEffect(() => {
		const getProposals = async () => {
			setIsLoading(true)
			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposals',
				args: {
					from_index: 0,
					limit: 10,
				},
			})

			for (const [i, proposal] of proposalDetail.entries()) {
				const proposalVotesWrap: IVotes = {}

				if (accountId) {
					const proposalVoteUser = await near.nearViewFunction({
						contractName: CONTRACT.DAO,
						methodName: 'get_proposal_vote',
						args: {
							id: proposal.id,
							account_id: accountId,
						},
					})

					if (proposalVoteUser) proposalVotesWrap[accountId as string] = proposalVoteUser
				}

				proposalDetail[i].proposal.votes = proposalVotesWrap
			}

			setProposals(proposalDetail)
			setIsLoading(false)
		}
		if (isInit) {
			getProposals()
		}
	}, [isInit])

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<div className="mt-4 max-w-3xl px-4 mx-auto pb-12">
					<VotingPower />
					<p className="my-4 font-bold text-2xl text-white">Proposal</p>
					{isLoading ? (
						<ProposalLoader />
					) : (
						proposals.map((proposal) => <ProposalItem key={proposal.id} data={proposal} />)
					)}
				</div>
			</div>
		</>
	)
}

const ProposalItem = ({ data }: { data: IProposal }) => {
	const { accountId } = useNearProvider()
	const userVotes = data.proposal.votes[accountId || '']

	const startTime = new Date((data.proposal.proposal_start_time || 0) / 10 ** 6)
	const endTime = new Date(startTime.getTime() + (data.proposal.proposal_period || 0) / 10 ** 6)

	const { hours, days } = getTimeRemaining(endTime.getTime())

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
					<p>
						{`${winnerOption} - ${prettyBalance(formatParasAmount(parasCountWinner), 0)} PARAS`}
					</p>
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
									<IconClock
										color={data.proposal.status === 'InProgress' ? '#4FA59E' : '#ffffff'}
									/>
									<p className={`${data.proposal.status === 'InProgress' ? 'text-[#4FA59E]' : ''}`}>
										{data.proposal.status === 'InProgress' && endTime.getTime() > Date.now()
											? `${days}D ${hours}H Remaining`
											: `Ended`}
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

export default Proposal
