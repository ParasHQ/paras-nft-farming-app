import VotesLoader from 'components/Loader/VotesLoader'
import { IProposal, IUserVote, IVotes } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount } from 'utils/common'
import VotesPeople from './VotesPeople'

interface IVotesListProps {
	proposal: IProposal
}

interface IContinousFetch {
	(page?: number): Promise<IVotes>
}

const VotesList = ({ proposal }: IVotesListProps) => {
	const [votes, setVotes] = useState<IVotes>()
	const [isVotesLoading, setIsVotesLoading] = useState(false)
	const [voteLength, setVoteLength] = useState(10)

	useEffect(() => {
		const getVotesContinuous: IContinousFetch = async (page = 0) => {
			const fetchLimit = 10
			const proposalVotes: [string, IUserVote][] = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposal_votes',
				args: {
					id: proposal.id,
					from_index: page * fetchLimit,
					limit: fetchLimit,
				},
			})

			const proposalVotesWrap: IVotes = {}

			proposalVotes.forEach((userVoteTuple) => {
				proposalVotesWrap[userVoteTuple[0]] = userVoteTuple[1]
			})

			return {
				...proposalVotesWrap,
				...(proposalVotes.length === fetchLimit ? await getVotesContinuous(page + 1) : {}),
			}
		}

		const getVotes = async () => {
			setIsVotesLoading(true)
			setVotes(await getVotesContinuous())
			setIsVotesLoading(false)
		}

		getVotes()
	}, [proposal.id])

	const fetchMoreVote = () => {
		const additionalVoteLength = Math.min(Object.entries(votes || {}).length - voteLength, 10)
		setVoteLength(voteLength + additionalVoteLength)
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
			{isVotesLoading ? (
				<VotesLoader />
			) : (
				votes &&
				Object.entries(votes)
					.sort(
						([, value1], [, value2]) =>
							parseInt(formatParasAmount(value2.user_weight)) -
							parseInt(formatParasAmount(value1.user_weight))
					)
					.slice(0, voteLength)
					.map(([key, value]) => {
						const user = value
						const percentage =
							(parseInt(formatParasAmount(user.user_weight)) /
								parseInt(formatParasAmount(proposal.proposal.total_vote_counts))) *
							100
						return (
							<VotesPeople
								key={key}
								option={user.vote_option}
								userId={key}
								percentage={percentage.toFixed(2)}
								weight={user.user_weight}
							/>
						)
					})
			)}
			{Object.entries(votes || {}).length > voteLength && (
				<p
					className="text-white text-sm text-right mt-4 opacity-80 hover:opacity-100 cursor-pointer"
					onClick={fetchMoreVote}
				>
					See More
				</p>
			)}
		</div>
	)
}

export default VotesList
