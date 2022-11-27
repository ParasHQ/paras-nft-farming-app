import { Transaction } from '@near-wallet-selector/core'
import axios from 'axios'
import Button from 'components/Common/Button'
import { LogoBounce } from 'components/Common/Loader'
import Modal from 'components/Common/Modal'
import NFTokenFarm from 'components/Common/NFTokenFarm'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import IconInfo from 'components/Icon/IconInfo'
import { apiFarmingURL } from 'constants/apiURL'
import { GAS_FEE } from 'constants/gasFee'
import { getAmount, useWalletSelector } from 'contexts/WalletSelectorContext'
import { ModalCommonProps } from 'interfaces/modal'
import { INFToken } from 'interfaces/token'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useEffect, useState } from 'react'
import { hasReward, prettyBalance } from 'utils/common'
import { CONTRACT } from 'utils/contract'
import InfoModal from './InfoModal'

interface StakeNFTModalProps extends ModalCommonProps {
	claimableRewards: {
		[key: string]: string
	}
	nftPoints: {
		[key: string]: string
	}
}

interface IResponseCheckNFT {
	data: { results: INFToken[] }
}

const StakeNFTModal = (props: StakeNFTModalProps) => {
	const [ownedNFT, setOwnedNFT] = useState<INFToken[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [showInfoPool, setShowInfoPool] = useState<boolean>(false)

	const { accountId, viewFunction, signAndSendTransactions } = useWalletSelector()

	useEffect(() => {
		const fetchOwnedNFT = async () => {
			ownedNFT.length === 0 && setIsLoading(true)
			try {
				const resp = await axios.get<IResponseCheckNFT>(`${apiFarmingURL}/check`, {
					params: {
						nft_farming_contract: CONTRACT.FARM,
						seed_id: props.seedId,
						owner_id: accountId,
					},
				})
				setOwnedNFT(resp.data.data.results)
			} catch (error) {
				console.log(error)
			}
			setIsLoading(false)
		}

		if (props.show && accountId) {
			fetchOwnedNFT()
		}
	}, [props.show, accountId, props.seedId, ownedNFT.length])

	const stakeNFT = async (tokenId: string, contractId: string, stakeAll = false) => {
		try {
			const txs: Transaction[] = []
			for (const contractName of Object.keys(props.claimableRewards || {})) {
				const deposited = await viewFunction({
					receiverId: contractName,
					methodName: `storage_balance_of`,
					args: {
						account_id: accountId,
					},
				})

				if (deposited === null || (deposited && (deposited as any).total === '0')) {
					txs.push({
						receiverId: contractName,
						actions: [
							{
								type: 'FunctionCall',
								params: {
									methodName: 'storage_deposit',
									args: {
										registration_only: true,
										account_id: accountId,
									},
									deposit: getAmount(parseNearAmount('0.00125')) as unknown as string,
									gas: getAmount(GAS_FEE[30]) as unknown as string,
								},
							},
						],
						signerId: contractName,
					})
				}
			}

			if (stakeAll) {
				ownedNFT.forEach((nft) => {
					txs.push({
						receiverId: nft.contract_id,
						actions: [
							{
								type: 'FunctionCall',
								params: {
									methodName: 'nft_transfer_call',

									args: {
										receiver_id: CONTRACT.FARM,
										token_id: nft.token_id,
										msg: props.seedId,
									},
									deposit: getAmount('1') as unknown as string,
									gas: getAmount(GAS_FEE[200]) as unknown as string,
								},
							},
						],
						signerId: nft.contract_id,
					})
				})
			} else {
				txs.push({
					receiverId: contractId,
					actions: [
						{
							type: 'FunctionCall',
							params: {
								methodName: 'nft_transfer_call',
								args: {
									receiver_id: CONTRACT.FARM,
									token_id: tokenId,
									msg: props.seedId,
								},
								deposit: getAmount('1') as unknown as string,
								gas: getAmount(GAS_FEE[200]) as unknown as string,
							},
						},
					],
					signerId: contractId,
				})
			}

			return await signAndSendTransactions({ transactions: txs })
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<>
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
							<div className="inline-block cursor-pointer" onClick={() => setShowInfoPool(true)}>
								<IconInfo className="w-6 h-6" />
							</div>
						</div>
					</div>
					{hasReward(Object.values(props.claimableRewards)) && (
						<div className="text-center">
							<p className="font-semibold text-sm mt-2">
								Staking will claim your rewards to your wallet:
							</p>
							{Object.keys(props.claimableRewards).map((k, idx) => {
								return (
									<div key={idx} className="text-sm">
										<PoolReward key={k} contractName={k} amount={props.claimableRewards[k]} />
									</div>
								)
							})}
						</div>
					)}

					{isLoading ? (
						<div className="mt-4 w-full h-[50vh] md:h-[60vh] flex flex-col items-center justify-center">
							<LogoBounce width={20} className="mb-4 opacity-50" />
						</div>
					) : (
						<div className="mt-4 h-[50vh] md:h-[60vh] overflow-y-scroll no-scrollbar">
							{ownedNFT.length !== 0 ? (
								<div className="md:grid md:grid-cols-2 md:gap-4">
									{ownedNFT.map((nft) => (
										<NFTokenFarm
											key={nft._id}
											token={nft}
											stakeNFT={stakeNFT}
											type="stake"
											point={prettyBalance(
												props.nftPoints[`${nft.contract_id}@${nft.token_id}`] ||
													props.nftPoints[`${nft.contract_id}@${nft.token_series_id}`] ||
													props.nftPoints[`${nft.contract_id}`],
												18,
												4
											)}
										/>
									))}
								</div>
							) : (
								<div className="w-full h-full flex items-center justify-center px-4 text-center">
									<div>
										<p>{"You don't have any NFT for this Pool"}</p>
										<Button className="mt-4 px-4" onClick={() => setShowInfoPool(true)}>
											Check Eligible NFT
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
					{ownedNFT.length >= 2 && (
						<div className="text-right">
							<Button className="mt-4 px-8" onClick={() => stakeNFT('', '', true)}>
								Stake all NFT
							</Button>
						</div>
					)}
				</div>
			</Modal>
			<InfoModal
				show={showInfoPool}
				onClose={() => setShowInfoPool(false)}
				nftPoints={props.nftPoints}
			/>
		</>
	)
}

export default StakeNFTModal
