import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import { IProposal } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { useNearProvider } from 'hooks/useNearProvider'
import VotingPower from 'components/Proposal/VotingPower'
import ProposalLoader from 'components/Loader/ProposalLoader'
import ProposalItem from 'components/Proposal/ProposalItem'
import InfiniteScroll from 'react-infinite-scroll-component'

const Proposal = () => {
	const [proposals, setProposals] = useState<IProposal[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const { isInit } = useNearProvider()
	const [hasMore, setHasMore] = useState(false)

	useEffect(() => {
		const getProposals = async () => {
			setIsLoading(true)
			const lastProposalId = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_last_proposal_id',
			})

			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposals_reverse',
				args: {
					from_index: lastProposalId,
					limit: 10,
				},
			})

			setHasMore(proposalDetail.length === 10)
			setProposals(proposalDetail)
			setIsLoading(false)
		}
		if (isInit) {
			getProposals()
		}
	}, [isInit])

	const fetchMoreData = async () => {
		if (!hasMore) return

		const proposalDetail = await near.nearViewFunction({
			contractName: CONTRACT.DAO,
			methodName: 'get_proposals_reverse',
			args: {
				from_index: proposals[proposals.length - 1].id - 1,
				limit: 10,
			},
		})

		setProposals((prevState) => [...prevState, ...proposalDetail])
		setHasMore(proposalDetail.length === 10)
	}

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<div className="mt-4 max-w-3xl px-4 mx-auto pb-12">
					<VotingPower />
					<p className="my-4 font-bold text-2xl text-white">Proposal</p>
					{isLoading && proposals.length === 0 ? (
						<ProposalLoader />
					) : (
						<InfiniteScroll
							dataLength={proposals.length}
							next={fetchMoreData}
							hasMore={hasMore}
							loader={<ProposalLoader length={1} />}
						>
							{proposals.map((proposal) => (
								<ProposalItem key={proposal.id} data={proposal} />
							))}
						</InfiniteScroll>
					)}
				</div>
			</div>
		</>
	)
}

export default Proposal
