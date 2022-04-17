import cachios from 'cachios'
import Media from 'components/Common/Media'
import { apiParasUrl } from 'constants/apiURL'
import { INFToken } from 'interfaces/token'
import { useEffect, useState } from 'react'
import { parseImgUrl, prettyBalance } from 'utils/common'

interface NFTProps {
	contractId: string
	tokenSeriesId: string
	tokenId: string
	value: string
}

const NFTInfo = ({ contractId, tokenSeriesId, value }: NFTProps) => {
	const [data, setData] = useState<INFToken>()
	const formatText = `https://paras.id/token/${contractId}::${tokenSeriesId}`

	useEffect(() => {
		if (contractId && tokenSeriesId) {
			const fetchNFT = async () => {
				try {
					const resp = await cachios.get<{ data: { results: INFToken[] } }>(
						`${apiParasUrl}/token-series`,
						{
							params: {
								contract_id: contractId,
								token_series_id: tokenSeriesId,
							},
							ttl: 600,
						}
					)

					setData(resp.data.data.results[0])
				} catch (error) {
					console.log(error)
				}
			}

			fetchNFT()
		}
	}, [contractId, tokenSeriesId])

	const openLink = () => {
		window.open(formatText, '_blank')
	}

	return (
		<div>
			{data?.metadata && (
				<div className="flex items-center mt-4 gap-4">
					<div className="w-16 rounded-md overflow-hidden relative">
						{data?.metadata && (
							<Media
								className="h-full object-cover relative z-10"
								url={parseImgUrl(data.metadata.media, '', { isMediaCdn: data.isMediaCdn })}
								videoControls={false}
								videoMuted={true}
								videoLoop={true}
							/>
						)}
					</div>
					<div className="flex-1 truncate w-full">
						<p
							onClick={openLink}
							className="font-bold text-lg truncate cursor-pointer hover:underline inline"
						>
							{data?.metadata.title}
						</p>
						<p className="text-sm opacity-80 truncate">
							by {data?.metadata.creator_id || data?.contract_id}
						</p>
					</div>
					<div className="text-right font-bold">
						<p>{prettyBalance(value, 18, 2)} Pts</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default NFTInfo
