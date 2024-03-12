import axios from 'axios'
import { useEffect, useState } from 'react'

const CommonBanner = () => {
	const [data, setData] = useState<{ bannerText: string } | null>(null)

	useEffect(() => {
		const getCommonBanner = async () => {
			const resp = await axios.get(`${process.env.NEXT_PUBLIC_API_PARAS}/small-banner`)
			setData(resp?.data?.result?.[0])
		}
		getCommonBanner()
	}, [])

	if (!data) return null

	return (
		<div className="bg-primary relative z-50 flex items-center justify-center overflow-hidden bg-[#1C32FF] p-2 text-center text-xs text-white md:m-auto md:h-8 md:text-sm md:leading-8">
			<div
				dangerouslySetInnerHTML={{
					__html: data?.bannerText,
				}}
			/>
		</div>
	)
}

export default CommonBanner
