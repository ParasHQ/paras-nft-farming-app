import dayjs from 'dayjs'
import { prettyBalance, toHumanReadableNumbers } from 'utils/common'
import Button from './Common/Button'
import { useCallback, useEffect, useRef, useState } from 'react'
import near, { CONTRACT, getAmount } from 'services/near'
import axios from 'axios'
import StakeTokenModal from './Modal/StakeTokenModal'
import UnstakeTokenModal from './Modal/UnstakeTokenModal'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { IFarm, IPool, IReward } from 'interfaces'
import PoolLoader from './Common/PoolLoader'
import JSBI from 'jsbi'
import PoolReward from './Common/PoolReward'
import PoolAPR, { contractPriceMap, getPrice } from './Common/PoolAPR'
import StakeNFTModal from './Modal/StakeNFTModal'
import UnstakeNFTModal from './Modal/UnstakeNFTModal'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import ReactTooltip from 'react-tooltip'
import IconInfo from './Icon/IconInfo'
import ClaimModal from './Modal/ClaimModal'
import { useStore } from 'services/store'
import cachios from 'cachios'
import LockedStakeTokenModal from './Modal/LockedStakeTokenModal'
import UnlockedStakeTokenModal from './Modal/UnlockedStakeTokenModal'

export interface IPoolProcessed {
	title: string
	totalStaked: any
	totalStakedInUSD: any
	apr: string
	realAPR: string
	startDate: number | null
	endDate: number | null
	rewards: {
		[key: string]: IReward
	}
	claimableRewards: {
		[key: string]: string
	}
	media: string
	nftPoints?: {
		[key: string]: string
	}
	comingSoon: boolean
	expired: boolean
	totalPoolReward: number
}

interface PoolProps {
	type: 'ft' | 'nft'
	data: IPool
	staked?: string
	stakedNFT?: string[]
	filterType?: string
	className?: string
}

interface IViewLocked {
	seed_id: string
	balance: string
	started_at: number
	ended_at: number
}

type TShowModal =
	| 'stakeNFT'
	| 'stakePARAS'
	| 'unstakeNFT'
	| 'unstakePARAS'
	| 'claim'
	| 'LockedStakePARAS'
	| 'UnlockedStakePARAS'
	| null

const MainPool = ({ data, staked, stakedNFT, type, filterType = 'all', className }: PoolProps) => {
	const { accountId, hasDeposit, setCommonModal } = useNearProvider()
	const [poolProcessed, setPoolProcessed] = useState<IPoolProcessed | null>(null)
	const [showModal, setShowModal] = useState<TShowModal>(null)
	const [userStaked, setUserStaked] = useState<string | null>(null)
	const [userFullStaked, setUserFullStaked] = useState<string | null>(null)
	const [lockedData, setLockedData] = useState<IViewLocked[]>([])
	const [lockedDuration, setLockedDuration] = useState<number>()
	const [isGettingLockedStake, setIsGettingLockedStake] = useState(true)
	const [isWithinDuration, setIsWithinDuration] = useState<boolean[]>([])
	const [isWithinDurationEndedAt, setIsWithinDurationEndedAt] = useState<boolean[]>([])
	const isTopup = useRef<boolean>(false)
	const { setFTPool } = useStore()

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
		let allStartDate = 0
		let endDate = null
		let allEndDate = 0
		let totalRewardPerYearInUSD = 0
		let allTotalRewardPerYearInUSD = 0

		// sum all rewards from the pool
		let allTotalRewardsPoolInUSD = 0

		const totalRewards: {
			[key: string]: IReward
		} = {}
		const allTotalRewards: {
			[key: string]: IReward
		} = {}
		const totalUnclaimedRewards: {
			[key: string]: string
		} = {}

		const seedDetails = await near.nearViewFunction({
			contractName: CONTRACT.FARM,
			methodName: `get_seed_info`,
			args: {
				seed_id: data.seed_id,
			},
		})

		for (const farmId of data.farms) {
			const farmDetails: IFarm = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: `get_farm`,
				args: {
					farm_id: farmId,
				},
			})

			const farmEndDate =
				farmDetails.start_at +
				(farmDetails.session_interval * farmDetails.total_reward) / farmDetails.reward_per_session

			// check if hasn't started or expired
			const currentTs = new Date().getTime() / 1000
			if (farmDetails.start_at > currentTs || currentTs > farmEndDate) {
				if (allStartDate) {
					if (farmDetails.start_at < allStartDate) {
						allStartDate = farmDetails.start_at
					}
				} else {
					allStartDate = farmDetails.start_at
				}

				if (allEndDate) {
					if (allEndDate < farmEndDate) {
						allEndDate = farmEndDate
					}
				} else {
					allEndDate = farmEndDate
				}

				const farmTotalRewardPerWeek =
					(farmDetails.reward_per_session * 86400 * 7) / farmDetails.session_interval
				const farmTotalRewardPerWeekInUSD = farmTotalRewardPerWeek * parasPriceInDecimal

				const farmTotalRewardPerYearInUSD = farmTotalRewardPerWeekInUSD * 52
				allTotalRewardPerYearInUSD += farmTotalRewardPerYearInUSD

				if (allTotalRewards[farmDetails.reward_token]) {
					allTotalRewards[farmDetails.reward_token] = {
						amount: JSBI.add(
							JSBI.BigInt(allTotalRewards[farmDetails.reward_token].amount),
							JSBI.BigInt(farmTotalRewardPerWeek)
						).toString(),
						startDateTs: farmDetails.start_at,
						endDateTs: farmEndDate,
					}
				} else {
					allTotalRewards[farmDetails.reward_token] = {
						amount: JSBI.BigInt(farmTotalRewardPerWeek).toString(),
						startDateTs: farmDetails.start_at,
						endDateTs: farmEndDate,
					}
				}
			} else {
				if (startDate) {
					if (farmDetails.start_at < startDate) {
						startDate = farmDetails.start_at
					}
				} else {
					startDate = farmDetails.start_at
				}

				if (endDate) {
					if (endDate < farmEndDate) {
						endDate = farmEndDate
					}
				} else {
					endDate = farmEndDate
				}

				const farmTotalRewardPerWeek =
					(farmDetails.reward_per_session * 86400 * 7) / farmDetails.session_interval
				const farmTotalRewardPerWeekInUSD = farmTotalRewardPerWeek * parasPriceInDecimal

				const farmTotalRewardPerYearInUSD = farmTotalRewardPerWeekInUSD * 52
				totalRewardPerYearInUSD += farmTotalRewardPerYearInUSD

				const ftTokenDetail = contractPriceMap[farmDetails.reward_token]
				const ftTokenPriceInUSD = await getPrice(ftTokenDetail.url, ftTokenDetail.symbol)
				const ftTokenRewardFormatted = JSBI.toNumber(
					JSBI.divide(
						JSBI.BigInt(farmDetails.total_reward),
						JSBI.BigInt(10 ** ftTokenDetail.decimals)
					)
				)

				const rewardFarm = ftTokenPriceInUSD * ftTokenRewardFormatted
				allTotalRewardsPoolInUSD += rewardFarm

				if (totalRewards[farmDetails.reward_token]) {
					totalRewards[farmDetails.reward_token] = {
						amount: JSBI.add(
							JSBI.BigInt(totalRewards[farmDetails.reward_token].amount),
							JSBI.BigInt(farmTotalRewardPerWeek)
						).toString(),
						startDateTs: farmDetails.start_at,
						endDateTs: farmEndDate,
					}
				} else {
					totalRewards[farmDetails.reward_token] = {
						amount: JSBI.BigInt(farmTotalRewardPerWeek).toString(),
						startDateTs: farmDetails.start_at,
						endDateTs: farmEndDate,
					}
				}
			}

			if (accountId) {
				const unclaimedReward = await near.nearViewFunction({
					contractName: CONTRACT.FARM,
					methodName: `get_unclaimed_reward`,
					args: {
						account_id: near.wallet.getAccountId(),
						farm_id: farmId,
					},
				})
				if (totalUnclaimedRewards[farmDetails.reward_token]) {
					totalUnclaimedRewards[farmDetails.reward_token] = JSBI.add(
						JSBI.BigInt(unclaimedReward),
						JSBI.BigInt(totalUnclaimedRewards[farmDetails.reward_token])
					).toString()
				} else {
					totalUnclaimedRewards[farmDetails.reward_token] = unclaimedReward
				}
			}
		}

		if (type === 'ft') {
			const rewardwnear = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: `get_reward`,
				args: {
					account_id: near.wallet.getAccountId(),
					token_id: CONTRACT.WRAP,
				},
			})
			if (totalUnclaimedRewards[CONTRACT.WRAP]) {
				totalUnclaimedRewards[CONTRACT.WRAP] = JSBI.add(
					JSBI.BigInt(rewardwnear),
					JSBI.BigInt(totalUnclaimedRewards[CONTRACT.WRAP])
				).toString()
			} else {
				totalUnclaimedRewards[CONTRACT.WRAP] = rewardwnear
			}
		}

		// if has no start date, means the pool is coming soon
		// use all data instead of active data
		const activeAPR = totalStakedInUSD > 0 ? (totalRewardPerYearInUSD * 100) / totalStakedInUSD : 0
		const allAPR = totalStakedInUSD > 0 ? (allTotalRewardPerYearInUSD * 100) / totalStakedInUSD : 0

		const APR = startDate ? activeAPR : allAPR
		const poolStartDate = startDate ? startDate * 1000 : allStartDate * 1000
		const poolEndDate = endDate ? endDate * 1000 : allEndDate * 1000

		const poolData: IPoolProcessed = {
			title: data.title,
			media: data.media,
			apr: APR > 9999 ? `9,999%+` : `${prettyBalance(APR.toString(), 0, 1)}%`,
			realAPR: `${prettyBalance(APR.toString(), 0, 1)}%`,
			totalStaked: data.amount / 10 ** 18,
			totalStakedInUSD: totalStakedInUSD,
			rewards: startDate ? totalRewards : allTotalRewards,
			startDate: poolStartDate,
			endDate: poolEndDate,
			claimableRewards: totalUnclaimedRewards,
			nftPoints: seedDetails.nft_balance,
			comingSoon: poolStartDate < new Date().getTime() ? false : true,
			expired: poolEndDate > new Date().getTime() ? false : true,
			totalPoolReward: allTotalRewardsPoolInUSD,
		}

		setPoolProcessed(poolData)
		type === 'ft' && setFTPool(poolData)
	}, [data.amount, data.title, data.media, data.farms, accountId])

	const FTPoolModal = () => {
		return (
			<>
				<StakeTokenModal
					seedId={data.seed_id}
					title={data.title}
					show={showModal === 'stakePARAS'}
					onClose={() => setShowModal(null)}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
				/>
				<UnstakeTokenModal
					seedId={data.seed_id}
					title={data.title}
					show={showModal === 'unstakePARAS'}
					onClose={() => setShowModal(null)}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
				/>
			</>
		)
	}

	const LockingFTPoolModal = () => {
		return (
			<>
				<LockedStakeTokenModal
					show={showModal === 'LockedStakePARAS'}
					onClose={() => setShowModal(null)}
					seedId={data.seed_id}
					title={data.title}
					userStaked={userStaked as string}
					userFullStaked={userFullStaked as string}
					isTopup={isTopup.current}
					lockedBalance={Number(lockedData[0]?.balance)}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
					isWithinDuration={isWithinDuration[0]}
				/>
				<UnlockedStakeTokenModal
					show={showModal === 'UnlockedStakePARAS'}
					onClose={() => setShowModal(null)}
					seedId={data.seed_id}
					title={data.title}
					userStaked={userStaked as string}
					isTopup={isTopup.current}
					lockedBalance={Number(lockedData[0]?.balance)}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
					isWithinDuration={isWithinDuration[0]}
				/>
			</>
		)
	}

	const NFTPoolModal = () => {
		return (
			<>
				<StakeNFTModal
					seedId={data.seed_id}
					nftPoints={poolProcessed && poolProcessed.nftPoints ? poolProcessed.nftPoints : {}}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
					title={data.title}
					show={showModal === 'stakeNFT'}
					onClose={() => setShowModal(null)}
				/>
				<UnstakeNFTModal
					seedId={data.seed_id}
					nftPoints={poolProcessed && poolProcessed.nftPoints ? poolProcessed.nftPoints : {}}
					claimableRewards={poolProcessed ? poolProcessed.claimableRewards : {}}
					title={data.title}
					show={showModal === 'unstakeNFT'}
					onClose={() => setShowModal(null)}
				/>
			</>
		)
	}

	const claimRewards = async (restaked = false) => {
		if (!accountId) return

		const txs: {
			receiverId: string
			functionCalls: FunctionCallOptions[]
		}[] = []

		for (const contractName of Object.keys(poolProcessed?.rewards || {})) {
			const deposited = await near.nearViewFunction({
				contractName: contractName,
				methodName: `storage_balance_of`,
				args: {
					account_id: near.wallet.getAccountId(),
				},
			})
			if (!deposited) {
				txs.push({
					receiverId: contractName,
					functionCalls: [
						{
							methodName: 'storage_deposit',
							contractId: contractName,
							args: {
								registration_only: true,
								account_id: accountId,
							},
							attachedDeposit: getAmount(parseNearAmount('0.0125')),
							gas: getAmount(GAS_FEE[30]),
						},
					],
				})
			}
		}

		txs.push({
			receiverId: CONTRACT.FARM,
			functionCalls: [
				{
					methodName: restaked
						? 'claim_reward_by_seed_and_deposit'
						: 'claim_reward_by_seed_and_withdraw',
					contractId: CONTRACT.FARM,
					args: {
						seed_id: data.seed_id,
						token_id: CONTRACT.TOKEN,
						...(restaked && {
							seed_id_deposit: CONTRACT.TOKEN,
							is_deposit_seed_reward: true,
						}),
					},
					attachedDeposit: getAmount('1'),
					gas: getAmount(GAS_FEE[150]),
				},
			],
		})

		return await near.executeMultipleTransactions(txs)
	}

	const onClickActionButton = (type: TShowModal) => {
		if (!accountId) {
			setCommonModal('login')
			return
		}

		if (!hasDeposit) {
			setCommonModal('deposit')
			return
		}

		setShowModal(type)
	}

	const getLockedStake = async () => {
		setIsGettingLockedStake(true)
		const _lockedBalanceDetails: IViewLocked = await near.nearViewFunction({
			methodName: `list_user_locked_seeds`,
			contractName: CONTRACT.FARM,
			args: {
				account_id: accountId,
			},
		})
		const lockedBalanceDetails: IViewLocked[] = Object.entries(_lockedBalanceDetails)
			.filter((x) => {
				return x[0] === CONTRACT.TOKEN
			})
			.map((value) => ({
				seed_id: value[0],
				balance: value[1].balance,
				started_at: value[1].started_at,
				ended_at: value[1].ended_at,
			}))
		const isWithinDurationArr: boolean[] = []
		const isWithinDurationEndedAtArr: boolean[] = []
		lockedBalanceDetails.map((value) => {
			if (
				new Date().getTime() / 1000 > value.started_at &&
				new Date().getTime() / 1000 < value.ended_at + 60 * 60 * 24
			) {
				isWithinDurationArr.push(true)
			} else {
				isWithinDurationArr.push(false)
			}
			if (
				new Date().getTime() / 1000 > value.started_at &&
				new Date().getTime() / 1000 < value.ended_at
			) {
				isWithinDurationEndedAtArr.push(true)
			} else {
				isWithinDurationEndedAtArr.push(false)
			}
		})
		const THIRTY_IN_SECONDS = 2592000
		if (lockedBalanceDetails.length > 0) {
			const diffStartedEnded =
				lockedBalanceDetails[0].ended_at - lockedBalanceDetails[0].started_at === THIRTY_IN_SECONDS
			if (diffStartedEnded) {
				setLockedDuration(30)
			} else {
				setLockedDuration(90)
			}
		}
		setIsWithinDuration(isWithinDurationArr)
		setIsWithinDurationEndedAt(isWithinDurationEndedAtArr)
		setLockedData(lockedBalanceDetails)
		setIsGettingLockedStake(false)
	}

	useEffect(() => {
		if (accountId) {
			getLockedStake()
		}
	}, [])

	useEffect(() => {
		if (type === 'nft' && stakedNFT) {
			const nftPtsStaked = stakedNFT.reduce((a, b) => {
				const pts =
					poolProcessed && poolProcessed.nftPoints
						? poolProcessed.nftPoints[b] ||
						  poolProcessed.nftPoints[b.split(':')[0]] ||
						  poolProcessed.nftPoints[b.split('@')[0]]
						: '0'
				return JSBI.add(a, JSBI.BigInt(pts || '0'))
			}, JSBI.BigInt(0))

			setUserStaked(nftPtsStaked.toString())
		}
	}, [type, stakedNFT, poolProcessed])

	useEffect(() => {
		if (type === 'ft' && staked && !isGettingLockedStake) {
			setUserStaked(
				lockedData.length > 0 ? `${Number(staked) - Number(lockedData[0].balance)}` : staked
			)
			setUserFullStaked(staked)
		}
	}, [type, staked])

	useEffect(() => {
		getFarms()
	}, [getFarms])

	if (!poolProcessed) {
		return (
			<div className={className}>
				<PoolLoader />
			</div>
		)
	}

	if (filterType === 'ended' && !poolProcessed.expired) {
		return null
	}

	if (filterType === 'active' && poolProcessed.expired) {
		return null
	}

	if (
		filterType === 'staked' &&
		Object.values(poolProcessed.claimableRewards).findIndex((x) => Number(x) > 0) === -1
	) {
		return null
	}

	return (
		<div className={`relative text-white ${className}`}>
			{poolProcessed.comingSoon && (
				<div className="absolute -mt-3 z-30 text-center inset-x-0">
					<div className="bg-gray-100 text-parasGrey inline-block px-4 rounded-md font-semibold">
						Coming Soon
					</div>
				</div>
			)}
			{poolProcessed.expired && (
				<div className="absolute -mt-3 z-30 text-center inset-x-0">
					<div className="bg-gray-100 text-parasGrey inline-block px-4 rounded-md font-semibold">
						Ended
					</div>
				</div>
			)}
			{FTPoolModal()}
			{NFTPoolModal()}
			{LockingFTPoolModal()}
			<ClaimModal
				type={type}
				show={showModal === 'claim'}
				onClose={() => setShowModal(null)}
				claimAndDeposit={() => claimRewards(true)}
				claimAndWithdraw={() => claimRewards(false)}
				poolname={data.title}
				claimableRewards={poolProcessed.claimableRewards}
			/>
			<div
				className={`bg-parasGrey text-white rounded-xl overflow-hidden shadow-xl ${
					poolProcessed.expired && 'saturate-50 opacity-70'
				}`}
			>
				<ReactTooltip html={true} />
				<div className="bg-center bg-no-repeat bg-black bg-opacity-40 p-4 relative">
					<div className="absolute inset-0 opacity-20">
						<div className="text-center h-full overflow-hidden">
							{poolProcessed.media && (
								<img
									className="w-full h-full"
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
								{type === 'ft' && (
									<p
										className="text-4xl font-semibold"
										data-tip={`<p class="text-base">${prettyBalance(data.amount, 18, 4)} Ⓟ</p>`}
									>
										${toHumanReadableNumbers(poolProcessed.totalStakedInUSD)}
									</p>
								)}
								{type === 'nft' && (
									<p className="text-4xl font-semibold">
										{toHumanReadableNumbers(poolProcessed.totalStaked)} Pts
									</p>
								)}
							</div>
							<div className="text-right">
								{type === 'ft' && (
									<>
										<p className="opacity-75">APR</p>
										<PoolAPR
											rewardsPerWeek={poolProcessed.rewards}
											totalStakedInUSD={poolProcessed.totalStakedInUSD}
										/>
									</>
								)}
								{type === 'nft' && (
									<>
										<p className="opacity-75">Total Reward</p>
										<p className="text-4xl font-semibold">
											${toHumanReadableNumbers(poolProcessed.totalPoolReward.toString())}
										</p>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="px-4 pb-4">
					<div>
						<div className="mt-4">
							<div className="flex justify-between">
								<div>
									<p className="opacity-75">Start Date</p>
									<p>{dayjs(poolProcessed.startDate).format('MMM D, YYYY')}</p>
								</div>
								<div className="text-right">
									<p className="opacity-75">End Date</p>
									<p>{dayjs(poolProcessed.endDate).format('MMM D, YYYY')}</p>
								</div>
							</div>
						</div>
						<div className="mt-4">
							<div className="flex justify-between">
								<div>
									<p className="opacity-75">Reward per Week</p>
								</div>
								<div className="flex flex-col items-end">
									{Object.keys(poolProcessed.rewards).map((k) => {
										return (
											<div
												key={k}
												data-tip={`<div>
												<p class="text-base">Start: ${dayjs(poolProcessed.rewards[k].startDateTs * 1000).format(
													'MMM D, YYYY h:mm A'
												)}</p>
												<p class="text-base">End: ${dayjs(poolProcessed.rewards[k].endDateTs * 1000).format(
													'MMM D, YYYY h:mm A'
												)}</p>
												</div>`}
												className="flex items-center"
											>
												<PoolReward contractName={k} amount={poolProcessed.rewards[k].amount} />
												<div className="pl-1 opacity-75">
													<IconInfo className="w-4 h-4" />
												</div>
											</div>
										)
									})}
								</div>
							</div>
							{type === 'ft' && (
								<div className="flex justify-between mt-1">
									<div>
										<p className="opacity-75">Staked PARAS</p>
									</div>
									<div className="text-right">
										<p>{userStaked ? `${prettyBalance(userStaked, 18)} Ⓟ` : '-'} </p>
									</div>
								</div>
							)}
							{type === 'nft' && (
								<div className="flex justify-between mt-1">
									<div>
										<p className="opacity-75">Staked NFT</p>
									</div>
									<div className="text-right">
										<p>{userStaked ? `${prettyBalance(userStaked, 18)} Pts` : '-'} </p>
									</div>
								</div>
							)}
						</div>
						<div className="mt-4">
							{type === 'ft' && (
								<div className="flex justify-between -mx-4">
									<div className="w-1/2 px-4">
										<Button isFullWidth onClick={() => onClickActionButton('stakePARAS')}>
											Stake PARAS
										</Button>
									</div>
									<div className="w-1/2 px-4 text-right">
										<Button
											color="blue-gray"
											isFullWidth
											onClick={() => onClickActionButton('unstakePARAS')}
										>
											Unstake PARAS
										</Button>
									</div>
								</div>
							)}
							{type === 'nft' && (
								<div className="flex justify-between -mx-4">
									<div className="w-1/2 px-4">
										{!poolProcessed.expired && (
											<Button isFullWidth onClick={() => onClickActionButton('stakeNFT')}>
												Stake NFT
											</Button>
										)}
									</div>
									<div className="w-1/2 px-4 text-right">
										<Button
											isFullWidth
											color="blue-gray"
											onClick={() => onClickActionButton('unstakeNFT')}
										>
											Unstake NFT
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
					{accountId && (
						<div className="mt-4">
							<div className="flex justify-between items-center p-2 bg-black bg-opacity-60 rounded-md overflow-hidden">
								<div className="w-2/3">
									<p className="opacity-75">Claimable Rewards</p>
									{Object.keys(poolProcessed.claimableRewards).map((k) => {
										return (
											<PoolReward
												key={k}
												contractName={k}
												amount={poolProcessed.claimableRewards[k]}
											/>
										)
									})}
								</div>
								<div className="w-1/3">
									<Button
										isDisabled={
											Object.values(poolProcessed.claimableRewards).findIndex(
												(x) => Number(x) > 0
											) === -1
										}
										isFullWidth
										color="green"
										onClick={() => setShowModal('claim')}
									>
										Claim
									</Button>
								</div>
							</div>
						</div>
					)}
					<div className="mt-4 flex justify-center items-center">
						{accountId && lockedData.length > 0 ? (
							<>
								{lockedData.map((value, index) => {
									if (isWithinDuration[index]) {
										return (
											<>
												<div className="w-full">
													<div key={index} className="flex justify-between mb-1">
														<div
															data-tip={`<div>
														<p class="text-base">Start: ${dayjs.unix(value.started_at).format('MMM D, YYYY h:mm:ss A')}</p>
														</div>`}
														>
															<div className="opacity-75 flex items-center">
																<p className="opacity-75">Start Date</p>
																<IconInfo className="w-5 h-5 pl-1" />
															</div>
															<p>{dayjs.unix(value.started_at).format('MMM D, YYYY')}</p>
														</div>
														<div
															className="text-right"
															data-tip={`<div>
														<p class="text-base">End: ${dayjs.unix(value.ended_at).format('MMM D, YYYY h:mm:ss A')}</p></div>`}
														>
															<div className="opacity-75 flex items-center">
																<p className="opacity-75">End Date</p>
																<IconInfo className="w-5 h-5 pl-1" />
															</div>{' '}
															<p>{dayjs.unix(value.ended_at).format('MMM D, YYYY')}</p>
														</div>
													</div>
													<div className="flex justify-between mb-6">
														<div className="flex items-center">
															<p className="mr-1">Locked Staking</p>
															<div className="p-1 text-xs text-white flex justify-center items-center rounded bg-blueGray">
																{lockedDuration} days
															</div>
														</div>
														<div>
															<p>{prettyBalance(value.balance, 18)} Ⓟ</p>
														</div>
													</div>
													<div className="flex justify-between -mx-4">
														<div className="w-1/2 px-4">
															<Button
																isFullWidth
																onClick={() => {
																	isTopup.current = true
																	onClickActionButton('LockedStakePARAS')
																}}
															>
																Top Up
															</Button>
														</div>
														<div className="w-1/2 px-4 text-right">
															<Button
																isDisabled={isWithinDurationEndedAt[0]}
																color="blue-gray"
																isFullWidth
																onClick={() => onClickActionButton('UnlockedStakePARAS')}
															>
																Unlock PARAS
															</Button>
														</div>
													</div>{' '}
												</div>
											</>
										)
									} else {
										return (
											<div className="flex w-1/2 justify-center px-4">
												<Button
													isFullWidth
													onClick={() => {
														isTopup.current = false
														onClickActionButton('LockedStakePARAS')
													}}
												>
													Locked Staking
												</Button>
											</div>
										)
									}
								})}
							</>
						) : (
							<div className="flex w-1/2 justify-center px-4">
								<Button
									isFullWidth
									onClick={() => {
										isTopup.current = false
										onClickActionButton('LockedStakePARAS')
									}}
								>
									Locked Staking
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default MainPool
