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
		total_vote_counts: number
		vote_counts: {
			[key: string]: string
		}
		votes: {
			[key: string]: { vote_option: string; user_weight: number }
		}
		submission_time: number
		proposal_start_time: number
		proposal_period: number
	}
}
