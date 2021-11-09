import dayjs from 'dayjs'
import { prettyBalance, toHumanReadableNumbers } from 'utils/common'
import Button from './Common/Button'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import near from 'services/near'
import axios from 'axios'
import StakeModal from './Modal/StakeModal'
import UnstakeModal from './Modal/UnstakeModal'

interface IFarm {
	beneficiary_reward: string
	claimed_reward: string
	cur_round: number
	farm_id: string
	farm_kind: string
	farm_status: string
	last_round: number
	media: string
	reward_per_session: any
	reward_token: any
	seed_id: string
	session_interval: number
	start_at: number
	title: string
	total_reward: any
	unclaimed_reward: string
}

interface IPoolProcessed {
	title?: string
	totalStaked?: any
	apr?: number
	startDate?: number | null
	endDate?: number | null
	rewardPerWeek?: any
	claimableRewards?: string
	media?: string
}

interface IPool {
	title: string
	seed_id: string
	seed_type: string
	next_index: number
	amount: any
	min_deposit: string
	nft_multiplier: {
		[key: string]: number
	}
	farms: string[]
	media: string
}

interface PoolProps {
	data: IPool
}

type TShowModal = 'stakeNFT' | 'stakePARAS' | 'unstakeNFT' | 'unstakePARAS' | null

const Pool = ({ data }: PoolProps) => {
	const [poolProcessed, setPoolProcessed] = useState<IPoolProcessed>({})
	const [showModal, setShowModal] = useState<TShowModal>(null)

	const getParasPrice = async () => {
		const resp = await axios.get(
			'https://api.coingecko.com/api/v3/simple/price?ids=PARAS&vs_currencies=USD'
		)
		return resp.data.paras.usd
	}

	const getFarms = useCallback(async () => {
		const parasPrice = await getParasPrice()
		const parasPriceInDecimal = parasPrice / 10 ** 18

		const totalStakedInUSD = data.amount * parasPriceInDecimal

		let startDate = null
		let endDate = null
		let totalRewardPerWeek = 0
		let totalRewardPerWeekInUSD = 0
		let totalRewardPerYearInUSD = 0

		for (const farmId of data.farms) {
			const farmDetails: IFarm = await near.nearViewFunction({
				contractName: `dev-1636378463768-19826484030009`,
				methodName: `get_farm`,
				args: {
					farm_id: farmId,
				},
			})

			console.log(farmId, farmDetails)

			const farmTotalRewardPerWeek =
				(farmDetails.reward_per_session * 86400 * 7) / farmDetails.session_interval
			const farmTotalRewardPerWeekInUSD = farmTotalRewardPerWeek * parasPriceInDecimal

			totalRewardPerWeek += farmTotalRewardPerWeek
			totalRewardPerWeekInUSD += farmTotalRewardPerWeekInUSD

			const farmTotalRewardPerYearInUSD = farmTotalRewardPerWeekInUSD * 52
			totalRewardPerYearInUSD += farmTotalRewardPerYearInUSD

			const farmEndDate =
				farmDetails.start_at +
				(farmDetails.session_interval * farmDetails.total_reward) / farmDetails.reward_per_session

			if (startDate) {
				if (farmDetails.start_at < startDate) {
					startDate = farmDetails.start_at
				}
			} else {
				startDate = farmDetails.start_at
			}

			if (endDate) {
				if (farmEndDate < endDate) {
					endDate = farmEndDate
				}
			} else {
				endDate = farmEndDate
			}
		}

		const APR = totalStakedInUSD > 0 ? (totalRewardPerYearInUSD * 100) / totalStakedInUSD : 0
		const poolData: IPoolProcessed = {
			title: data.title,
			media: data.media,
			apr: APR,
			totalStaked: totalStakedInUSD,
			rewardPerWeek: totalRewardPerWeek,
			startDate: startDate ? startDate * 1000 : null,
			endDate: endDate ? endDate * 1000 : null,
		}
		setPoolProcessed(poolData)
	}, [data.farms, data.amount, data.title, data.media])

	const PoolModal = () => {
		return (
			<>
				<StakeModal show={showModal === 'stakePARAS'} onClose={() => setShowModal(null)} />
				<UnstakeModal show={showModal === 'unstakePARAS'} onClose={() => setShowModal(null)} />
			</>
		)
	}

	useEffect(() => {
		getFarms()
	}, [getFarms])

	return (
		<div className="bg-parasGrey text-white rounded-xl overflow-hidden shadow-xl">
			{PoolModal()}
			<div className="bg-center bg-no-repeat bg-black bg-opacity-40 p-4 relative">
				<div className="absolute inset-0 opacity-20">
					<div className="text-center h-full overflow-hidden">
						{poolProcessed.media && (
							<Image
								objectPosition="center bottom"
								objectFit="contain"
								layout="fill"
								alt={poolProcessed.title}
								src={poolProcessed.media}
							/>
						)}
					</div>
				</div>
				<div className="relative">
					<p className="text-3xl font-bold text-center">{poolProcessed.title}</p>
					<div className="flex justify-between mt-4">
						<div>
							<p className="opacity-75">Total Staked</p>
							<p className="text-4xl font-semibold">
								${toHumanReadableNumbers(poolProcessed.totalStaked)}
							</p>
						</div>
						<div className="text-right">
							<p className="opacity-75">APR</p>
							<p className="text-4xl font-semibold">{prettyBalance(poolProcessed.apr, 1, 1)}%</p>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 pb-4">
				<div className="mt-4">
					<div className="flex justify-between">
						<div>
							<p className="opacity-75">Start Date</p>
							<p>{dayjs(poolProcessed.startDate).format('MMM D, YYYY')}</p>
						</div>
						<div className="text-right">
							<p className="opacity-75">Start Date</p>
							<p>{dayjs(poolProcessed.endDate).format('MMM D, YYYY')}</p>
						</div>
					</div>
				</div>
				<div>
					<div className="mt-4">
						<div className="flex justify-between">
							<div>
								<p className="opacity-75">Reward per Week</p>
							</div>
							<div className="text-right">
								<p>{prettyBalance(poolProcessed.rewardPerWeek, 18)} Ⓟ</p>
							</div>
						</div>
						<div className="flex justify-between mt-1">
							<div>
								<p className="opacity-75">NFT Multiplier</p>
							</div>
							{/* <div className="text-right">
							<p>{poolProcessed.nftMultiplier}%</p>
						</div> */}
						</div>
						<div className="flex justify-between mt-1">
							<div>
								<p className="opacity-75">Staked PARAS</p>
							</div>
							{/* <div className="text-right">
							<p>{prettyBalance(poolProcessed.userStaked, 18)} Ⓟ</p>
						</div> */}
						</div>
					</div>
					<div className="mt-4">
						<div className="flex justify-between -mx-4">
							<div className="w-1/2 px-4">
								<Button isFullWidth className="" onClick={() => {}}>
									Stake NFT
								</Button>
								<Button isFullWidth className=" mt-2" color="red" onClick={() => {}}>
									Unstake NFT
								</Button>
							</div>
							<div className="w-1/2 px-4 text-right">
								<Button isFullWidth onClick={() => setShowModal('stakePARAS')}>
									Stake PARAS
								</Button>
								<Button
									isFullWidth
									className=" mt-2"
									color="red"
									onClick={() => setShowModal('unstakePARAS')}
								>
									Unstake PARAS
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<div className="flex justify-between items-center p-2 bg-black bg-opacity-60 rounded-md overflow-hidden">
						<div className="w-2/3">
							<p className="opacity-75">Claimable Rewards</p>
							<p>{prettyBalance(poolProcessed.claimableRewards, 18)} Ⓟ</p>
						</div>
						<div className="w-1/3">
							<Button isFullWidth color="green" onClick={() => {}}>
								Claim
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Pool
