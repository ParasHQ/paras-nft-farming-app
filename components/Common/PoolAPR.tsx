import { useEffect, useState } from 'react'
import { prettyBalance } from 'utils/common'
import { IReward } from 'interfaces'
import cachios from 'cachios'
import { CONTRACT } from 'utils/contract'

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
		[key: string]: IReward
	}
	totalStakedInUSD: number
}

export const contractPriceMap: IContractPriceData = {
	[CONTRACT.TOKEN]: {
		url: 'https://api.coingecko.com/api/v3/simple/price?ids=PARAS&vs_currencies=USD',
		symbol: `paras`,
		decimals: 18,
	},
	[CONTRACT.WRAP]: {
		url: 'https://api.coingecko.com/api/v3/simple/price?ids=NEAR&vs_currencies=USD',
		symbol: 'near',
		decimals: 24,
	},
	[CONTRACT.REF]: {
		url: 'https://api.coingecko.com/api/v3/simple/price?ids=ref-finance&vs_currencies=USD',
		symbol: 'ref-finance',
		decimals: 18,
	},
}

export const getPrice = async (url: string, symbol: string, decimals = 0) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const resp = await cachios.get<any>(url)
		return resp.data[symbol].usd / 10 ** decimals
	} catch (error) {
		return -1
	}
}

const PoolAPR = ({ rewardsPerWeek, totalStakedInUSD }: PoolAPRProps) => {
	const [data, setData] = useState<number | null>(null)

	useEffect(() => {
		const getMetadata = async () => {
			const apr: { [key: string]: number } = {}
			for (const ftContract of Object.keys(rewardsPerWeek)) {
				const currPrice = await getPrice(
					contractPriceMap[ftContract]?.url,
					contractPriceMap[ftContract]?.symbol,
					contractPriceMap[ftContract]?.decimals
				)
				if (currPrice === -1) {
					setData(-1)
					return
				}
				const rewardPerYearInUSD = parseInt(rewardsPerWeek[ftContract].amount) * 52 * currPrice

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

	if (data === null) {
		return (
			<div>
				<p>Loading...</p>
			</div>
		)
	}

	if (data === -1) {
		return null
	}

	return (
		<div>
			<p
				className="text-4xl font-semibold"
				data-tip={`<p class="text-base">${prettyBalance(data.toString(), 0, 1)}%</p>`}
			>
				{data > 9999 ? `9,999%+` : `${prettyBalance(data.toString(), 0, 1)}%`}
			</p>
		</div>
	)
}

export default PoolAPR
