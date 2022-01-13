import dayjs from 'dayjs'
import { prettyBalance, toHumanReadableNumbers } from 'utils/common'
import Button from './Common/Button'
import { useCallback, useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import axios from 'axios'
import StakeTokenModal from './Modal/StakeTokenModal'
import UnstakeTokenModal from './Modal/UnstakeTokenModal'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { IFarm, IPool } from 'interfaces'
import PoolLoader from './Common/PoolLoader'
import StakeNFTModal from './Modal/StakeNFTModal'
import UnstakeNFTModal from './Modal/UnstakeNFTModal'
import JSBI from 'jsbi'

interface IPoolProcessed {
	title: string
	totalStaked: any
	apr: string
	startDate: number | null
	endDate: number | null
	rewardPerWeek: any
	claimableRewards: string
	media: string
	nftPoints: {
		[key: string]: string
	}
}

interface PoolProps {
	data: IPool
	stakedNFT: string[]
}

type TShowModal = 'stakeNFT' | 'stakePARAS' | 'unstakeNFT' | 'unstakePARAS' | null

const Pool = ({ data, stakedNFT }: PoolProps) => {
	const { accountId, hasDeposit, setCommonModal } = useNearProvider()
	const [poolProcessed, setPoolProcessed] = useState<IPoolProcessed | null>(null)
	const [showModal, setShowModal] = useState<TShowModal>(null)
	const [nftPoint, setNftPoint] = useState('0')

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
		let totalRewardPerYearInUSD = 0
		let totalUnclaimedReward = '0'

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

			if (accountId) {
				const unclaimedReward = await near.nearViewFunction({
					contractName: CONTRACT.FARM,
					methodName: `get_unclaimed_reward`,
					args: {
						account_id: near.wallet.getAccountId(),
						farm_id: farmId,
					},
				})
				totalUnclaimedReward = JSBI.add(
					JSBI.BigInt(unclaimedReward),
					JSBI.BigInt(totalUnclaimedReward)
				).toString()
			}

			const farmTotalRewardPerWeek =
				(farmDetails.reward_per_session * 86400 * 7) / farmDetails.session_interval
			const farmTotalRewardPerWeekInUSD = farmTotalRewardPerWeek * parasPriceInDecimal

			totalRewardPerWeek += farmTotalRewardPerWeek

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
			apr: APR > 99999 ? `99,999%+` : `${prettyBalance(APR, 0, 1)}%`,
			totalStaked: totalStakedInUSD,
			rewardPerWeek: totalRewardPerWeek,
			startDate: startDate ? startDate * 1000 : null,
			endDate: endDate ? endDate * 1000 : null,
			claimableRewards: totalUnclaimedReward,
			nftPoints: seedDetails.nft_balance,
		}

		setPoolProcessed(poolData)
	}, [data.amount, data.title, data.media, data.farms, accountId])

	useEffect(() => {
		if (stakedNFT && poolProcessed?.nftPoints) {
			const x = stakedNFT.reduce((a, b) => {
				return JSBI.add(a, JSBI.BigInt(poolProcessed.nftPoints[b.split(':')[0]]))
			}, JSBI.BigInt(0))

			setNftPoint(x.toString())
		}
	}, [stakedNFT, poolProcessed])

	const claimRewards = async () => {
		if (!accountId) return

		await near.nearFunctionCall({
			methodName: 'claim_reward_by_seed_and_withdraw',
			contractName: CONTRACT.FARM,
			args: {
				seed_id: data.seed_id,
				token_id: CONTRACT.TOKEN,
			},
			amount: '1',
			gas: GAS_FEE[300],
		})
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

	useEffect(() => {
		getFarms()
	}, [getFarms])

	const PoolModal = () => {
		return (
			<>
				<StakeNFTModal
					seedId={data.seed_id}
					nftPoints={poolProcessed ? poolProcessed.nftPoints : {}}
					claimableRewards={poolProcessed?.claimableRewards}
					title={data.title}
					show={showModal === 'stakeNFT'}
					onClose={() => setShowModal(null)}
				/>
				<UnstakeNFTModal
					seedId={data.seed_id}
					nftPoints={poolProcessed ? poolProcessed.nftPoints : {}}
					claimableRewards={poolProcessed?.claimableRewards}
					title={data.title}
					show={showModal === 'unstakeNFT'}
					onClose={() => setShowModal(null)}
				/>
			</>
		)
	}

	if (!poolProcessed) {
		return <PoolLoader />
	}

	return (
		<div className="bg-parasGrey text-white rounded-xl overflow-hidden shadow-xl">
			{PoolModal()}
			<div className="bg-center bg-no-repeat bg-black bg-opacity-40 p-4 relative">
				<div className="absolute inset-0 opacity-20">
					<div className="text-center h-full overflow-hidden">
						{poolProcessed.media && (
							<img className="w-full h-full" alt={poolProcessed.title} src={poolProcessed.media} />
						)}
					</div>
				</div>
				<div className="relative">
					<p className="text-3xl font-bold text-center">{poolProcessed.title}</p>
					<div className="flex justify-between mt-4">
						<div>
							<p className="opacity-75">Total Staked</p>
							<p className="text-4xl font-semibold">
								{toHumanReadableNumbers(poolProcessed.totalStaked)} Pts
							</p>
						</div>
						<div className="text-right">
							<p className="opacity-75">APR</p>
							<p className="text-4xl font-semibold">{poolProcessed.apr}</p>
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
							<p className="opacity-75">End Date</p>
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
								<p className="opacity-75">Staked NFTs</p>
							</div>
							<div className="text-right">
								<p>{nftPoint !== '0' ? `${prettyBalance(nftPoint, 18, 4)} Pts` : '-'}</p>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<div className="flex justify-between -mx-4">
							<div className="w-1/2 px-4">
								<Button isFullWidth className="" onClick={() => onClickActionButton('stakeNFT')}>
									Stake NFT
								</Button>
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
					</div>
				</div>
				{accountId && (
					<div className="mt-4">
						<div className="flex justify-between items-center p-2 bg-black bg-opacity-60 rounded-md overflow-hidden">
							<div className="w-2/3">
								<p className="opacity-75">Claimable Rewards</p>
								<p>{prettyBalance(poolProcessed.claimableRewards, 18, 6)} Ⓟ</p>
							</div>
							<div className="w-1/3">
								<Button
									isDisabled={poolProcessed.claimableRewards.toString() === '0'}
									isFullWidth
									color="green"
									onClick={claimRewards}
								>
									Claim
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Pool
