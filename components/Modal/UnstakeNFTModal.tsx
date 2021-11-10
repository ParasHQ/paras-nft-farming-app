import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

interface UnstakeNFTModalProps {
	seedId: string
	show: boolean
	onClose: () => void
}

interface stakedResponse {
	[key: string]: string[]
}

const UnstakeNFTModal = (props: UnstakeNFTModalProps) => {
	const { accountId } = useNearProvider()
	const [stakedNFT, setStakedNFT] = useState<stakedResponse>({})

	useEffect(() => {
		const getStakedNFT = async () => {
			if (accountId) {
				const res: stakedResponse = await near.nearViewFunction({
					contractName: CONTRACT.FARM,
					methodName: 'list_user_nft_seeds',
					args: {
						account_id: accountId,
					},
				})
				setStakedNFT(res)
			}
		}

		if (props.show) {
			getStakedNFT()
		}
	}, [accountId, props.show])

	const unstakeNFT = (nft: string) => {
		const [contractId, tokenId] = nft.split('@')
		near.nearFunctionCall({
			contractName: CONTRACT.FARM,
			methodName: 'withdraw_nft',
			args: {
				seed_id: props.seedId,
				nft_contract_id: contractId,
				nft_token_id: tokenId,
			},
			amount: '1',
			gas: GAS_FEE[300],
		})
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Unstake NFT</p>
						<p className="text-white text-sm -mt-1">Pillars of Paras Pool</p>
					</div>
					<div className="w-1/5" />
				</div>
				<div>
					{stakedNFT[props.seedId]?.map((nft) => (
						<div key={nft} className="flex justify-between mb-2">
							<div>{nft}</div>
							<Button className="px-4" size="sm" onClick={() => unstakeNFT(nft)}>
								Unstake
							</Button>
						</div>
					))}
				</div>
			</div>
		</Modal>
	)
}

export default UnstakeNFTModal
