import { IFTMetadata } from 'interfaces'
import { useEffect, useState } from 'react'
import near from 'services/near'
import { prettyBalance } from 'utils/common'

interface PoolRewardProps {
	contractName: string
	amount: string
}

const PoolReward = ({ contractName, amount }: PoolRewardProps) => {
	const [data, setData] = useState<IFTMetadata | null>(null)

	useEffect(() => {
		const getMetadata = async () => {
			const metadata = await near.nearViewFunction({
				contractName: contractName,
				methodName: `ft_metadata`,
				args: {},
			})

			setData(metadata)
		}
		getMetadata()
	}, [])

	if (!data) {
		return (
			<div>
				<p>Loading...</p>
			</div>
		)
	}

	return (
		<div>
			<p>
				{prettyBalance(amount, data.decimals, 3)} {data.symbol}
			</p>
		</div>
	)
}

export default PoolReward
