import Header from 'components/Common/Header'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { IDataInputDropdown, IPool } from 'interfaces'
import Head from 'components/Common/Head'
import MainPool from 'components/MainPool'
import Loader from 'components/Common/Loader'
import InputDropdown from 'components/Common/InputDropdown'
import { useWalletSelector } from 'contexts/WalletSelectorContext'

interface IUserStaked {
	[key: string]: string
}

interface IUserStakedNFT {
	[key: string]: string[]
}

const filterData = [
	{ id: 'all', label: 'All Pool' },
	{ id: 'active', label: 'Active' },
	{ id: 'staked', label: 'Staked' },
	{ id: 'ended', label: 'Ended' },
]

interface IContinousFetch {
	(page?: number): Promise<IPool[]>
}

const Home: NextPage = () => {
	const { isInit, accountId } = useWalletSelector()
	const [poolListFT, setPoolListFT] = useState<IPool[]>([])
	const [poolList, setPoolList] = useState<IPool[]>([])
	const [userStaked, setUserStaked] = useState<IUserStaked>({})
	const [userStakedNFT, setUserStakedNFT] = useState<IUserStakedNFT>({})
	const [filterPool, setFilterPool] = useState<IDataInputDropdown>(filterData[1])

	useEffect(() => {
		console.log('isInit', isInit)
		console.log('accountId', accountId)
	}, [])

	// useEffect(() => {
	// 	const continousFetch: IContinousFetch = async (page = 0) => {
	// 		const fetchLimit = 7
	// 		const rawPoolList: IPool[] = await near.nearViewFunction({
	// 			contractName: CONTRACT.FARM,
	// 			methodName: `list_seeds_info`,
	// 			args: {
	// 				from_index: page * fetchLimit,
	// 				limit: fetchLimit,
	// 			},
	// 		})
	// 		const _poolList = Object.values(rawPoolList)

	// 		return [
	// 			..._poolList,
	// 			...(_poolList.length === fetchLimit ? await continousFetch(page + 1) : []),
	// 		]
	// 	}

	// 	const getPoolList = async () => {
	// 		const poolList = await continousFetch()

	// 		const poolFT = Object.values(poolList).filter((x) => x.seed_id === CONTRACT.TOKEN)
	// 		const poolNFT = Object.values(poolList).filter((x) => x.seed_type === 'NFT')
	// 		setPoolListFT(poolFT)
	// 		setPoolList(poolNFT)
	// 	}

	// 	if (isInit) {
	// 		getPoolList()
	// 	}
	// }, [isInit])

	// useEffect(() => {
	// 	const getUserStaked = async () => {
	// 		const userStakedToken = await near.nearViewFunction({
	// 			contractName: CONTRACT.FARM,
	// 			methodName: `list_user_seeds`,
	// 			args: {
	// 				account_id: accountId,
	// 			},
	// 		})

	// 		const userStakedNFTData = await near.nearViewFunction({
	// 			contractName: CONTRACT.FARM,
	// 			methodName: `list_user_nft_seeds`,
	// 			args: {
	// 				account_id: accountId,
	// 			},
	// 		})

	// 		setUserStaked(userStakedToken)
	// 		setUserStakedNFT(userStakedNFTData)
	// 	}

	// 	if (accountId) {
	// 		getUserStaked()
	// 	}
	// }, [accountId])

	// if (!Array.isArray(poolListFT) || poolListFT.length === 0) {
	// 	return (
	// 		<div>
	// 			<Loader isLoading={true} />
	// 		</div>
	// 	)
	// }

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				{/* <div className="mt-4 max-w-6xl mx-auto">
					<div className="md:max-w-md mx-auto p-4">
						<MainPool type="ft" data={poolListFT[0]} staked={userStaked[poolListFT[0].seed_id]} />
						<p className="text-white text-center text-sm mt-3">
							<span className="opacity-80">Learn more about PARAS Staking </span>
							<a
								className="font-bold text-white opacity-100 border-b-2 border-transparent hover:border-gray-100"
								href="https://paras.id/publication/now-live-earn-more-paras-by-paras-nft-staking-61e97465e26ebffd22443d4a"
								target="_blank"
							>
								HERE
							</a>
							{` `}and PARAS Locked Staking{` `}
							<a
								className="font-bold text-white opacity-100 border-b-2 border-transparent hover:border-gray-100"
								href="https://paras.id/loyalty"
								target="_blank"
							>
								HERE
							</a>
						</p>
					</div>
					<div className="mt-12 relative">
						<div className="flex justify-center gap-4 md:gap-0 md:block">
							{poolList.length > 0 && (
								<p className="text-white text-3xl font-semibold text-center mb-4">NFT Staking</p>
							)}
							<div className="md:absolute top-0 right-0 z-50 md:pr-4 flex justify-center mb-4">
								<InputDropdown
									fullWidth={false}
									defaultValue={filterPool.label}
									selectItem={setFilterPool}
									data={filterData}
								/>
							</div>
						</div>
						<div className="flex flex-wrap">
							{poolList.map((pool, idx) => {
								return (
									<MainPool
										type="nft"
										data={pool}
										stakedNFT={userStakedNFT[pool.seed_id]}
										filterType={filterPool.id}
										key={idx}
										className="w-full md:w-1/2 lg:w-1/3 p-4"
									/>
								)
							})}
						</div>
					</div>
				</div> */}
			</div>
		</>
	)
}

export default Home
