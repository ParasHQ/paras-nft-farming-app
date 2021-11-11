export interface IPool {
	title: string
	seed_id: string
	seed_type: string
	next_index: number
	amount: any
	min_deposit: string
	nft_multiplier: {
		[key: string]: number
	}
	farms: string[]
	media: string
}

export interface IFarm {
	beneficiary_reward: string
	claimed_reward: string
	cur_round: number
	farm_id: string
	farm_kind: string
	farm_status: string
	last_round: number
	media: string
	reward_per_session: any
	reward_token: any
	seed_id: string
	session_interval: number
	start_at: number
	title: string
	total_reward: any
	unclaimed_reward: string
}

export interface IProfile {
	accountId?: string
	imgUrl?: string
}
