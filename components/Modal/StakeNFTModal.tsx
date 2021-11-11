import axios from 'axios'
import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { apiURL } from 'constants/apiURL'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { IToken } from 'interfaces/token'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

interface StakeNFTModalProps {
	show: boolean
	seedId: string
	onClose: () => void
}

interface IResponseCheckNFT {
	data: { results: IToken[] }
}

const StakeNFTModal = (props: StakeNFTModalProps) => {
	const [ownedNFT, setOwnedNFT] = useState<IToken[]>([])
	const { accountId, hasDeposit, setCommonModal } = useNearProvider()

	useEffect(() => {
		const fetchOwnedNFT = async () => {
			try {
				const resp = await axios.get<IResponseCheckNFT>(`${apiURL}/check`, {
					params: {
						nft_farming_contract: CONTRACT.FARM,
						seed_id: props.seedId,
						owner_id: accountId,
					},
				})
				setOwnedNFT(resp.data.data.results)
			} catch (error) {}
		}

		if (props.show && accountId) {
			fetchOwnedNFT()
		}
	}, [props.show, accountId, props.seedId])

	const stakeNFT = async (tokenId: string, contractId: string) => {
		if (!hasDeposit) {
			setCommonModal('deposit')
			return
		}

		await near.nearFunctionCall({
			contractName: contractId,
			methodName: 'nft_transfer_call',
			amount: '1',
			args: {
				receiver_id: CONTRACT.FARM,
				token_id: tokenId,
				msg: props.seedId,
			},
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
						<p className="font-bold text-xl text-white">Stake NFT</p>
						<p className="text-white text-sm -mt-1">Pillars of Paras Pool</p>
					</div>
					<div className="w-1/5" />
				</div>
				<div>
					{ownedNFT.length !== 0 &&
						ownedNFT.map((nft) => (
							<div key={nft._id} className="flex justify-between mb-2">
								<div>{nft.metadata.title}</div>
								<Button
									className="px-4"
									size="sm"
									onClick={() => stakeNFT(nft.token_id, nft.contract_id)}
								>
									Stake
								</Button>
							</div>
						))}
				</div>
			</div>
		</Modal>
	)
}

export default StakeNFTModal
