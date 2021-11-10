import Pool from 'components/Pool'
import Header from 'components/Common/Header'
import { useNearProvider } from 'hooks/useNearProvider'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { IPool } from 'interfaces'

interface IUserStaked {
	[key: string]: string
}

const Home: NextPage = () => {
	const { isInit } = useNearProvider()
	const [poolList, setPoolList] = useState<IPool[]>([])
	const [userStaked, setUserStaked] = useState<IUserStaked>({})
	const [userStakedNFT, setUserStakedNFT] = useState({})

	const { accountId } = useNearProvider()

	useEffect(() => {
		if (isInit) {
			getPoolList()
		}
		if (accountId) {
			getUserStaked()
		}
	}, [isInit, accountId])

	const getPoolList = async () => {
		const poolList: IPool[] = await near.nearViewFunction({
			contractName: CONTRACT.FARM,
			methodName: `list_seeds_info`,
			args: {
				from_index: 0,
				limit: 10,
			},
		})
		setPoolList(Object.values(poolList))
	}

	const getUserStaked = async () => {
		const userStakedToken = await near.nearViewFunction({
			contractName: CONTRACT.FARM,
			methodName: `list_user_seeds`,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})

		const userStakedNFTData = await near.nearViewFunction({
			contractName: CONTRACT.FARM,
			methodName: `list_user_nft_seeds`,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})

		console.log(userStakedNFTData)
		setUserStaked(userStakedToken)
	}

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
								<Pool data={pool} staked={userStaked[pool.seed_id]} />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default Home
