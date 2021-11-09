import Pool from 'components/Pool'
import Header from 'components/Common/Header'
import { useNearProvider } from 'hooks/useNearProvider'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import near from 'services/near'

interface IPool {
	title: string
	seed_id: string
	seed_type: string
	next_index: number
	amount: string
	min_deposit: string
	nft_multiplier: {
		[key: string]: number
	}
	farms: string[]
	media: string
}

const Home: NextPage = () => {
	const { isInit } = useNearProvider()
	const [poolList, setPoolList] = useState<IPool[]>([])

	useEffect(() => {
		if (isInit) {
			getPoolList()
		}
	}, [isInit])

	const getPoolList = async () => {
		const poolList: IPool[] = await near.nearViewFunction({
			contractName: `dev-1636378463768-19826484030009`,
			methodName: `list_seeds_info`,
			args: {
				from_index: 0,
				limit: 10,
			},
		})
		setPoolList(Object.values(poolList))
	}

	console.log(poolList)

	return (
		<div className="bg-gray-900 min-h-screen">
			<div className="p-4">
				<Header />
			</div>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-wrap ">
					{poolList.map((pool, idx) => {
						return (
							<div className="w-full md:w-1/2 lg:w-1/3 p-4" key={idx}>
								<Pool data={pool} />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default Home
