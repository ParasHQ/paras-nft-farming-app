export interface IUserVote {
	vote_option: string
	user_weight: string
}

export interface IVotes {
	[key: string]: IUserVote
}

export interface IVotesGraph {
	id: string
	proposal_id: string
	account_id: string
	vote_option: string
	user_weight: string
}

export interface IProposal {
	id: number
	proposal: {
		proposer: string
		title: string
		description: string
		kind: {
			Vote: {
				vote_options: string[]
			}
		}
		status: string | any
		total_vote_counts: string
		vote_counts: {
			[key: string]: string
		}
		votes: IVotes
		submission_time: number
		proposal_start_time: number
		proposal_period: number
		unique_voters: string
	}
}
