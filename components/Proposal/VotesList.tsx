import axios from 'axios'
import VotesLoader from 'components/Loader/VotesLoader'
import { graphQLURL } from 'constants/apiURL'
import { IProposal, IVotesGraph } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import { formatParasAmount } from 'utils/common'
import VotesPeople from './VotesPeople'

interface IVotesListProps {
	proposal: IProposal
}

const VotesList = ({ proposal }: IVotesListProps) => {
	const defaultPage = 0
	const defaultSkip = 10

	const [votes, setVotes] = useState<IVotesGraph[]>([])
	const [isVotesLoading, setIsVotesLoading] = useState(false)
	const [page, setPage] = useState(defaultPage)
	const [hasMore, setHasMore] = useState(true)

	useEffect(() => {
		fetchVotes(proposal.id, defaultPage, true)
	}, [proposal.id])

	const fetchVotes = async (proposalId: number, _page: number, fromStart = false) => {
		setIsVotesLoading(true)
		const _skip = _page * defaultSkip
		const res = await axios({
			url: graphQLURL,
			method: 'post',
			data: {
				query: `
					query PostsForAuthor {
						votes(first: 10, skip: ${_skip}, where: {proposal_id_in: ["${proposalId}"]}, orderBy: user_weight, orderDirection: desc) {
							id
							proposal_id
							account_id
							vote_option
							user_weight
							receiptId
						}
					}
				`,
			},
		})
		const voteRes = res.data.data.votes

		setHasMore(voteRes.length === 10)
		setVotes((votes) => (fromStart ? voteRes : [...votes, ...voteRes]))
		setPage((page) => (fromStart ? 1 : page + 1))
		setIsVotesLoading(false)
	}

	return (
		<div className="text-white py-4 my-6">
			<p className="text-xl font-bold mb-2">Votes</p>
			<div className="flex justify-between items-end text-white text-opacity-80 text-sm font-light">
				<div className="w-2/5">
					<p>Account</p>
				</div>
				<div className="w-1/5 text-right mx-2">
					<p>Option</p>
				</div>
				<div className="w-1/6 text-right mx-2">
					<p>Percentage</p>
				</div>
				<div className="w-1/5 text-right">
					<p>Paras Power</p>
				</div>
			</div>
			{votes.map((vote) => {
				const percentage =
					(parseFloat(formatParasAmount(vote.user_weight)) /
						parseFloat(formatParasAmount(proposal.proposal.total_vote_counts))) *
					100
				return (
					<VotesPeople
						key={vote.account_id}
						option={vote.vote_option}
						userId={vote.account_id}
						percentage={percentage.toFixed(2)}
						weight={vote.user_weight}
					/>
				)
			})}
			{isVotesLoading ? (
				<VotesLoader />
			) : (
				hasMore && (
					<p
						className="text-white text-sm text-right mt-4 opacity-80 hover:opacity-100 cursor-pointer"
						onClick={() => fetchVotes(proposal.id, page)}
					>
						See More
					</p>
				)
			)}
		</div>
	)
}

export default VotesList
