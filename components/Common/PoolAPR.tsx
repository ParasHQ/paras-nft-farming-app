import axios from 'axios'
import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { prettyBalance } from 'utils/common'

interface IFTPriceData {
	url: string
	symbol: string
	decimals: number
}

interface IContractPriceData {
	[key: string]: IFTPriceData
}

interface PoolAPRProps {
	rewardsPerWeek: {
		[key: string]: string
	}
	totalStakedInUSD: number
}

const contractPriceMap: IContractPriceData = {
	'dev-1631277489384-75412609538902': {
		url: 'https://api.coingecko.com/api/v3/simple/price?ids=PARAS&vs_currencies=USD',
		symbol: `paras`,
		decimals: 18,
	},
	'wrap.testnet': {
		url: 'https://api.coingecko.com/api/v3/simple/price?ids=NEAR&vs_currencies=USD',
		symbol: 'near',
		decimals: 24,
	},
}

const getPrice = async (url: string, symbol: string, decimals: number) => {
	const resp = await axios.get(url)
	return resp.data[symbol].usd / 10 ** decimals
}

const PoolAPR = ({ rewardsPerWeek, totalStakedInUSD }: PoolAPRProps) => {
	const [data, setData] = useState<number | null>(null)

	useEffect(() => {
		const getMetadata = async () => {
			const apr: { [key: string]: number } = {}
			for (const ftContract of Object.keys(rewardsPerWeek)) {
				const currPrice = await getPrice(
					contractPriceMap[ftContract].url,
					contractPriceMap[ftContract].symbol,
					contractPriceMap[ftContract].decimals
				)
				const rewardPerYearInUSD = parseInt(rewardsPerWeek[ftContract]) * 52 * currPrice
				console.log(rewardPerYearInUSD)

				const APR = totalStakedInUSD > 0 ? (rewardPerYearInUSD * 100) / totalStakedInUSD : 0
				apr[ftContract] = APR
			}

			const totalAPR = Object.values(apr).reduce((a, b) => {
				return a + b
			}, 0)

			setData(totalAPR)
		}
		getMetadata()
	}, [rewardsPerWeek])

	if (!data) {
		return (
			<div>
				<p>Loading...</p>
			</div>
		)
	}

	return (
		<div>
			<ReactTooltip html={true} />
			<p
				className="text-4xl font-semibold"
				data-tip={`<p class="text-base">${prettyBalance(data, 0, 1)}%</p>`}
			>
				{data > 9999 ? `9,999%+` : `${prettyBalance(data, 0, 1)}%`}
			</p>
		</div>
	)
}

export default PoolAPR
