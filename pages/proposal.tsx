import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import IconClock from 'components/Icon/IconClock'
import IconShare from 'components/Icon/IconShare'
import { IProposal } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import Link from 'next/link'
import { useNearProvider } from 'hooks/useNearProvider'
import { getTimeRemaining } from 'utils/common'

const Proposal = () => {
	const [proposals, setProposals] = useState<IProposal[]>([])
	const { isInit } = useNearProvider()

	useEffect(() => {
		const getProposals = async () => {
			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposals',
				args: {
					from_index: 0,
					limit: 10,
				},
			})

			setProposals(proposalDetail)
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
				<div className="mt-4 max-w-3xl px-4 mx-auto">
					{proposals.map((proposal) => (
						<ProposalItem key={proposal.id} data={proposal} />
					))}
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

	return (
		<Link href={`/proposal/${data.id}`}>
			<div className="text-white p-6 rounded-xl shadow-xl bg-parasGrey relative mb-6 cursor-pointer">
				<p className="font-bold text-2xl">{data.proposal.title}</p>
				<p className="truncate">by {data.proposal.proposer}</p>
				<p className="my-6 text-white text-opacity-80">{data.proposal.description}</p>
				<div className="md:flex flex-row-reverse justify-between items-end">
					<div className="mb-2 md:mb-0 flex items-center gap-2">
						<IconClock color={data.proposal.status === 'InProgress' ? '#4FA59E' : '#ffffff'} />
						<p>
							{days}D {hours}H Remaining
						</p>
					</div>
					<p className="italic font-bold text-blueButton">
						{userVotes ? `You voted ${userVotes.vote_option}` : 'You have not voted'}
					</p>
				</div>
				<div className="absolute right-0 top-0 p-4">
					<IconShare />
				</div>
			</div>
		</Link>
	)
}

export default Proposal
