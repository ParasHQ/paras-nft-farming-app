import axios from 'axios'
import Modal from 'components/Common/Modal'
import NFTokenFarm from 'components/Common/NFTokenFarm'
import IconBack from 'components/Icon/IconBack'
import IconInfo from 'components/Icon/IconInfo'
import { apiFarmingURL } from 'constants/apiURL'
import { GAS_FEE } from 'constants/gasFee'
import { useNearProvider } from 'hooks/useNearProvider'
import { ModalCommonProps } from 'interfaces/modal'
import { INFToken } from 'interfaces/token'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

interface StakeNFTModalProps extends ModalCommonProps {}

interface IResponseCheckNFT {
	data: { results: INFToken[] }
}

const StakeNFTModal = (props: StakeNFTModalProps) => {
	const [ownedNFT, setOwnedNFT] = useState<INFToken[]>([])
	const { accountId } = useNearProvider()

	useEffect(() => {
		const fetchOwnedNFT = async () => {
			try {
				const resp = await axios.get<IResponseCheckNFT>(`${apiFarmingURL}/check`, {
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
			<div className="max-w-sm md:max-w-2xl w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Stake NFT</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5 text-right">
						<div className="inline-block cursor-pointer" onClick={() => console.log('click info')}>
							<IconInfo />
						</div>
					</div>
				</div>
				<div className="min-h-[16rem] max-h-[50vh] md:max-h-[60vh] overflow-y-scroll no-scrollbar md:grid md:grid-cols-2 md:gap-4">
					{ownedNFT.length !== 0 &&
						ownedNFT.map((nft) => <NFTokenFarm key={nft._id} token={nft} stakeNFT={stakeNFT} />)}
				</div>
			</div>
		</Modal>
	)
}

export default StakeNFTModal
