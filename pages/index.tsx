import Header from 'components/Common/Header'
import { useNearProvider } from 'hooks/useNearProvider'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { IPool } from 'interfaces'
import Head from 'components/Common/Head'
import MainPool from 'components/MainPool'
import Loader from 'components/Common/Loader'

interface IUserStaked {
	[key: string]: string
}

interface IUserStakedNFT {
	[key: string]: string[]
}

const Home: NextPage = () => {
	const { isInit, accountId } = useNearProvider()
	const [poolListFT, setPoolListFT] = useState<IPool[]>([])
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
			const poolFT = Object.values(poolList).filter((x) => x.seed_id === CONTRACT.TOKEN)
			const poolNFT = Object.values(poolList).filter((x) => x.seed_type === 'NFT')

			setPoolListFT(poolFT)
			setPoolList(poolNFT)
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
			console.log(userStakedNFTData)
		}

		if (accountId) {
			getUserStaked()
		}
	}, [accountId])

	if (!Array.isArray(poolList) || poolList.length === 0) {
		return (
			<div>
				<Loader isLoading={true} />
			</div>
		)
	}

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<div className="mt-4 max-w-6xl mx-auto">
					<div className="max-w-md mx-auto">
						<MainPool type="ft" data={poolListFT[0]} staked={userStaked[poolListFT[0].seed_id]} />
					</div>
					<div className="mt-12">
						<p className="text-white text-3xl font-semibold text-center">NFT Staking</p>
						<div className="flex flex-wrap">
							{poolList.map((pool, idx) => {
								return (
									<div className="w-full md:w-1/2 lg:w-1/3 p-4" key={idx}>
										<MainPool type="nft" data={pool} stakedNFT={userStakedNFT[pool.seed_id]} />
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home
