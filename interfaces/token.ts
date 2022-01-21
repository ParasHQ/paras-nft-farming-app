export interface INFToken {
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
		media_hash: never
		copies: number
		issued_at: string
		expires_at: never
		starts_at: never
		updated_at: never
		extra: never
		reference: string
		reference_hash: never
		collection: string
		collection_id: string
		creator_id: string
		blurhash: string
	}
	royalty: { [key: string]: number }
	price: null | string
	approval_id: never
	ft_token_id: never
	categories: []
}
