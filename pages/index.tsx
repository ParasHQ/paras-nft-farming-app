import Pool from 'components/Pool'
import Header from 'components/Common/Header'
import { useNearProvider } from 'hooks/useNearProvider'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { IPool } from 'interfaces'
import Head from 'components/Common/Head'

interface IUserStaked {
	[key: string]: string
}

interface IUserStakedNFT {
	[key: string]: string[]
}

const Home: NextPage = () => {
	const { isInit, accountId } = useNearProvider()
	const [poolList, setPoolList] = useState<IPool[]>([])
	const [userStaked, setUserStaked] = useState<IUserStaked>({})
	const [userStakedNFT, setUserStakedNFT] = useState<IUserStakedNFT>({})

	useEffect(() => {
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

		if (isInit) {
			getPoolList()
		}
	}, [isInit])

	useEffect(() => {
		const getUserStaked = async () => {
			const userStakedToken = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: `list_user_seeds`,
				args: {
					account_id: accountId,
				},
			})

			const userStakedNFTData = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: `list_user_nft_seeds`,
				args: {
					account_id: accountId,
				},
			})

			setUserStaked(userStakedToken)
			setUserStakedNFT(userStakedNFTData)
		}

		if (accountId) {
			getUserStaked()
		}
	}, [accountId])

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-wrap ">
						{poolList.map((pool, idx) => {
							return (
								<div className="w-full md:w-1/2 lg:w-1/3 p-4" key={idx}>
									<Pool
										data={pool}
										staked={userStaked[pool.seed_id]}
										stakedNFT={userStakedNFT[pool.seed_id]}
									/>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</>
	)
}

export default Home
