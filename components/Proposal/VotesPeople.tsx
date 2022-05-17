import cachios from 'cachios'
import { IProfile } from 'interfaces'
import { useEffect, useState } from 'react'
import { parseImgUrl, prettyBalance, prettyTruncate } from 'utils/common'

interface IVotesPeopleProps {
	userId: string
	option: string
	weight: string
	percentage: string
}

const VotesPeople = ({ userId, option, weight, percentage }: IVotesPeopleProps) => {
	const [userProfile, setUserProfile] = useState<IProfile>()

	useEffect(() => {
		const getUserProfile = async () => {
			const resp = await cachios.get<{ data: { results: IProfile[] } }>(
				`${process.env.NEXT_PUBLIC_API_PARAS}/profiles`,
				{
					params: {
						accountId: userId,
					},
					ttl: 600,
				}
			)
			if (resp.data.data.results[0]) {
				setUserProfile(resp.data.data.results[0])
			}
		}

		if (userId) {
			getUserProfile()
		}
	}, [userId])

	return (
		<div className="flex justify-between items-center my-2">
			<div className="w-2/5 flex items-center">
				<div>
					<div className="w-8 h-8 bg-gray-600 rounded-full mr-2">
						{userProfile?.imgUrl && (
							<img
								className="w-8 h-8 rounded-full"
								src={parseImgUrl(userProfile.imgUrl)}
								alt="profile-image"
							/>
						)}
					</div>
				</div>
				<p className="font-semibold truncate">{prettyTruncate(userId, 18, 'address')}</p>
			</div>
			<div className="w-1/5 text-right mx-2">
				<p className="capitalize truncate">{option}</p>
			</div>
			<div className="w-1/6 text-right mx-2">
				<p>{percentage}%</p>
			</div>
			<div className="w-1/5 text-right">
				<p>{prettyBalance(weight)} PARAS</p>
			</div>
		</div>
	)
}

export default VotesPeople
