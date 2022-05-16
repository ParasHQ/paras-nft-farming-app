import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import Loader from 'components/Loader/Loader'
import ProposalVote from 'components/Proposal/ProposalVote'
import VotesList from 'components/Proposal/VotesList'
import VotingPower from 'components/Proposal/VotingPower'
import dayjs from 'dayjs'
import { useNearProvider } from 'hooks/useNearProvider'
import { IProposal, IVotes } from 'interfaces/proposal'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount, prettyBalance } from 'utils/common'

export type TShowModal = 'delegate' | 'undelegate' | null

const ProposalItemDetail = () => {
	const [proposal, setProposal] = useState<IProposal>()
	const [delegationPrior, setDelegationPrior] = useState<string>('0')

	const { accountId } = useNearProvider()
	const router = useRouter()

	const startTime = new Date((proposal?.proposal.proposal_start_time || 0) / 10 ** 6)
	const endTime = new Date(
		startTime.getTime() + (proposal?.proposal.proposal_period || 0) / 10 ** 6
	)
	const isStarted = startTime.getTime() < Date.now()
	const isEnded = endTime.getTime() < Date.now()

	useEffect(() => {
		const getProposal = async () => {
			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposal',
				args: {
					id: parseInt(router.query.id as string),
				},
			})

			const uniqueVoters: string = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposal_vote_total',
				args: {
					id: parseInt(router.query.id as string),
				},
			})

			const proposalVotesWrap: IVotes = {}

			if (accountId) {
				const proposalVoteUser = await near.nearViewFunction({
					contractName: CONTRACT.DAO,
					methodName: 'get_proposal_vote',
					args: {
						id: parseInt(router.query.id as string),
						account_id: accountId,
					},
				})

				if (proposalVoteUser) proposalVotesWrap[accountId as string] = proposalVoteUser
			}

			proposalDetail.proposal.votes = proposalVotesWrap
			proposalDetail.proposal.unique_voters = uniqueVoters

			setProposal(proposalDetail)
		}

		if (router.query.id) {
			getProposal()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.id])

	useEffect(() => {
		const getDelegation = async () => {
			try {
				const delegationPrior = await near.nearViewFunction({
					contractName: CONTRACT.DAO,
					methodName: 'delegation_prior_balance_of',
					args: {
						account_id: accountId,
						block_timestamp: proposal?.proposal.proposal_start_time || 0,
					},
				})
				setDelegationPrior(delegationPrior)
			} catch (error) {
				console.log(error)
			}
		}

		if (accountId && proposal?.proposal.proposal_start_time) {
			getDelegation()
		}
	}, [accountId, proposal])

	if (!proposal) {
		return (
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Loader isLoading={true} />
				<div className="relative z-50">
					<Header />
				</div>
			</div>
		)
	}

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<div className="max-w-5xl w-full mx-auto px-4">
					<div className="md:flex md:gap-6 mt-8">
						<div className="md:w-3/5 text-white">
							<div className="flex items-center gap-2 text-white text-opacity-70 mb-4 text-sm font-extralight">
								<Link href="/proposal">
									<a>Proposal</a>
								</Link>
								<p>{'>'}</p>
								<p>{proposal.proposal.title}</p>
							</div>
							<p className="font-bold text-3xl">{proposal.proposal.title}</p>
							<p>by {proposal.proposal.proposer}</p>
							<p className="my-8 text-white text-opacity-80">{proposal.proposal.description}</p>
							<hr className="my-8" />

							<VotingPower />

							{proposal.proposal.status === 'InProgress' && !isEnded && (
								<ProposalVote delegationBalance={delegationPrior} proposal={proposal} />
							)}

							{proposal.proposal.votes[accountId || ''] && (
								<div className="italic font-bold text-blueButton mt-4">{`You voted ${
									proposal.proposal.votes[accountId || ''].vote_option
								} ~ ${prettyBalance(
									formatParasAmount(proposal.proposal.votes[accountId || ''].user_weight),
									0
								)} PARAS`}</div>
							)}

							<VotesList proposal={proposal} />
						</div>

						<div className="md:w-2/5">
							<div className="text-white p-4 rounded-md shadow-xl bg-parasGrey">
								<p className="text-xl font-bold mb-2">Information</p>
								<div className="flex justify-between">
									<p>Voting System</p>
									<p className="text-white text-opacity-80 font-light">Single choice voting</p>
								</div>
								<div className="flex justify-between">
									<p>Start date</p>
									<p className="text-white text-opacity-80 font-light">
										{dayjs(startTime.getTime()).format('MMM D, YYYY h:mm A')}
									</p>
								</div>
								<div className="flex justify-between">
									<p>End date</p>
									<p className="text-white text-opacity-80 font-light">
										{dayjs(endTime.getTime()).format('MMM D, YYYY h:mm A')}
									</p>
								</div>
							</div>

							{isStarted && (
								<div className="mt-4 text-white p-4 rounded-md shadow-xl bg-parasGrey">
									<p className="text-xl font-bold">{isEnded ? 'Results' : 'Current Result'}</p>
									{Object.entries(proposal.proposal.vote_counts)
										.sort(
											([, value1], [, value2]) =>
												parseInt(formatParasAmount(value2)) - parseInt(formatParasAmount(value1))
										)
										.map(([key, value]) => {
											const percentage = (
												(parseInt(formatParasAmount(value)) /
													parseInt(formatParasAmount(proposal.proposal.total_vote_counts))) *
												100
											).toFixed(2)

											return (
												<div className="mt-3" key={key}>
													<div className="flex justify-between">
														<p className="text-white text-opacity-80 capitalize">{key}</p>
														<p className="text-white text-opacity-80 text-right font-light">
															{prettyBalance(formatParasAmount(value), 0)} PARAS ({percentage}%)
														</p>
													</div>
													<div className="mt-2 relative w-full h-[0.45rem] rounded-md bg-gray-200 overflow-hidden">
														<div
															className="absolute h-full bg-blueButton"
															style={{ width: `${percentage}%` }}
														/>
													</div>
												</div>
											)
										})}
								</div>
							)}

							{isStarted && (
								<div className="mt-4 text-white p-4 rounded-md shadow-xl bg-parasGrey">
									<p className="text-xl font-bold mb-2">Voting Stats</p>
									<div className="flex justify-between">
										<p>Total Votes</p>
										<p className="text-white text-opacity-80 font-light">
											{prettyBalance(formatParasAmount(proposal.proposal.total_vote_counts), 0)}{' '}
											PARAS
										</p>
									</div>
									<div className="flex justify-between">
										<p>Unique Voters</p>
										<p className="text-white text-opacity-80 font-light">
											{proposal.proposal.unique_voters}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default ProposalItemDetail
