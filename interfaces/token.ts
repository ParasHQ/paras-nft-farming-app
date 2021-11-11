export interface IToken {
	_id: string
	contract_id: string
	token_id: string
	owner_id: string
	token_series_id: string
	edition_id: string
	metadata: {
		title: string
		description: string
		media: string
		media_hash: any
		copies: number
		issued_at: string
		expires_at: any
		starts_at: any
		updated_at: any
		extra: any
		reference: string
		reference_hash: any
		collection: string
		collection_id: string
		creator_id: string
		blurhash: string
	}
	royalty: { [key: string]: number }
	price: null | string
	approval_id: any
	ft_token_id: any
	categories: []
}
