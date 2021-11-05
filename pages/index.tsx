import Pool from 'components/Pool'
import type { NextPage } from 'next'

const DUMMY_POOL = [
	{
		title: `Pillars of Paras Pool`,
		image: `https://paras-ipfs.s3.ap-southeast-1.amazonaws.com/bafybeiarzwl5svvygc7jjoes2xniizawxyj5qweq2ppdvkcmtr3xe6qvq4`,
		totalStaked: `150000`,
		apr: `69`,
		startDate: new Date().getTime(),
		endDate: new Date().getTime(),
		rewardPerWeek: `69000000000000000000000`,
		userStaked: `12000000000000000000000`,
		nftMultiplier: 42,
		claimableRewards: `2000000000000000000000`,
	},
	{
		title: `Pillars of Paras Pool`,
		image: `https://paras-ipfs.s3.ap-southeast-1.amazonaws.com/bafybeiarzwl5svvygc7jjoes2xniizawxyj5qweq2ppdvkcmtr3xe6qvq4`,
		totalStaked: `150000`,
		apr: `69`,
		startDate: new Date().getTime(),
		endDate: new Date().getTime(),
		rewardPerWeek: `69000000000000000000000`,
		userStaked: `12000000000000000000000`,
		nftMultiplier: 42,
		claimableRewards: `2000000000000000000000`,
	},
	{
		title: `Pillars of Paras Pool`,
		image: `https://paras-ipfs.s3.ap-southeast-1.amazonaws.com/bafybeiarzwl5svvygc7jjoes2xniizawxyj5qweq2ppdvkcmtr3xe6qvq4`,
		totalStaked: `150000`,
		apr: `69`,
		startDate: new Date().getTime(),
		endDate: new Date().getTime(),
		rewardPerWeek: `69000000000000000000000`,
		userStaked: `12000000000000000000000`,
		nftMultiplier: 42,
		claimableRewards: `2000000000000000000000`,
	},
]

const Home: NextPage = () => {
	return (
		<div className="bg-gray-900 min-h-screen">
			<div className="p-4">
				<p className="text-3xl text-white text-center font-bold">PARAS Staking</p>
			</div>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-wrap ">
					{DUMMY_POOL.map((x, idx) => {
						return (
							<div className="w-full md:w-1/2 lg:w-1/3 p-4" key={idx}>
								<Pool data={x} />
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

export default Home
