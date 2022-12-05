import { useWalletSelector } from 'contexts/WalletSelectorContext'
import { IFTMetadata } from 'interfaces'
import { useEffect, useState } from 'react'
import { prettyBalance } from 'utils/common'

interface PoolRewardProps {
	contractName: string
	amount: string
	className?: string
}

const PoolReward = ({ contractName, amount, className = '' }: PoolRewardProps) => {
	const { viewFunction } = useWalletSelector()
	const [data, setData] = useState<IFTMetadata | null>(null)

	useEffect(() => {
		const getMetadata = async () => {
			const metadata = await viewFunction<IFTMetadata>({
				receiverId: contractName,
				methodName: `ft_metadata`,
				args: {},
			})

			setData(metadata)
		}
		getMetadata()
	}, [])

	if (!data) {
		return <p>Loading...</p>
	}

	return (
		<p className={className}>
			{prettyBalance(amount, data.decimals, 3)} {data.symbol}
		</p>
	)
}

export default PoolReward
