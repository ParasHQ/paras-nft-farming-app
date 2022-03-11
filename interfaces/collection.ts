export interface ICollection {
	_id: string
	collection_id: string
	blurhash: string
	collection: string
	cover: string | null
	createdAt: number
	creator_id: string
	description: string
	media: string
	socialMedia: {
		twitter: string | null
		discord: string | null
		website: string | null
	}
	updatedAt: number
	isCreator: boolean
	volume: number | null
}
