import dayjs from 'dayjs'
import { prettyBalance, toHumanReadableNumbers } from 'utils/common'
import Button from './Common/Button'
import Image from 'next/image'

interface PoolData {
	title: string
	image: string
	totalStaked: string
	apr: string
	startDate: number
	endDate: number
	rewardPerWeek: string
	userStaked: string
	nftMultiplier: number
	claimableRewards: string
}

interface PoolProps {
	data: PoolData
}

const Pool = ({ data }: PoolProps) => {
	return (
		<div className="bg-parasGrey text-white rounded-xl overflow-hidden shadow-xl">
			<div className="bg-center bg-no-repeat bg-black bg-opacity-40 p-4 relative">
				<div className="absolute inset-0 opacity-20">
					<div className="text-center h-full overflow-hidden">
						<Image
							objectPosition="center bottom"
							objectFit="contain"
							layout="fill"
							alt={data.title}
							src={data.image}
						/>
					</div>
				</div>
				<div className="relative">
					<p className="text-3xl font-bold text-center">{data.title}</p>
					<div className="flex justify-between mt-4">
						<div>
							<p className="opacity-75">Total Staked</p>
							<p className="text-4xl font-semibold">
								{toHumanReadableNumbers(data.totalStaked)}
								<span className="text-2xl pl-1">Ⓟ</span>
							</p>
						</div>
						<div className="text-right">
							<p className="opacity-75">APR</p>
							<p className="text-4xl font-semibold">
								{data.apr}
								<span className="text-2xl pl-1">%</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 pb-4">
				<div className="mt-4">
					<div className="flex justify-between">
						<div>
							<p className="opacity-75">Start Date</p>
							<p>{dayjs(data.startDate).format('MMM D, YYYY')}</p>
						</div>
						<div className="text-right">
							<p className="opacity-75">Start Date</p>
							<p>{dayjs(data.endDate).format('MMM D, YYYY')}</p>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<div className="flex justify-between">
						<div>
							<p className="opacity-75">Reward per Week</p>
						</div>
						<div className="text-right">
							<p>{prettyBalance(data.rewardPerWeek, 18)} Ⓟ</p>
						</div>
					</div>
					<div className="flex justify-between mt-1">
						<div>
							<p className="opacity-75">NFT Multiplier</p>
						</div>
						<div className="text-right">
							<p>{data.nftMultiplier}%</p>
						</div>
					</div>
					<div className="flex justify-between mt-1">
						<div>
							<p className="opacity-75">Staked PARAS</p>
						</div>
						<div className="text-right">
							<p>{prettyBalance(data.userStaked, 18)} Ⓟ</p>
						</div>
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
							<Button isFullWidth className="" onClick={() => {}}>
								Stake PARAS
							</Button>
							<Button isFullWidth className=" mt-2" color="red" onClick={() => {}}>
								Unstake PARAS
							</Button>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<div className="flex justify-between items-center p-2 bg-black bg-opacity-60 rounded-md overflow-hidden">
						<div className="w-2/3">
							<p className="opacity-75">Claimable Rewards</p>
							<p>{prettyBalance(data.claimableRewards, 18)} Ⓟ</p>
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
