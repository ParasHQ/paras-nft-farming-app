import { Transaction } from '@near-wallet-selector/core'
import axios from 'axios'
import cachios from 'cachios'
import Button from 'components/Common/Button'
import { LogoBounce } from 'components/Common/Loader'
import Modal from 'components/Common/Modal'
import NFTokenFarm from 'components/Common/NFTokenFarm'
import PoolReward from 'components/Common/PoolReward'
import IconBack from 'components/Icon/IconBack'
import { apiParasUrl } from 'constants/apiURL'
import { GAS_FEE } from 'constants/gasFee'
import { getAmount, useWalletSelector } from 'contexts/WalletSelectorContext'
import { ModalCommonProps } from 'interfaces/modal'
import { INFToken } from 'interfaces/token'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { useEffect, useState } from 'react'
import { hasReward, prettyBalance } from 'utils/common'
import { CONTRACT } from 'utils/contract'

interface UnstakeNFTModalProps extends ModalCommonProps {
	nftPoints: {
		[key: string]: string
	}
	claimableRewards: {
		[key: string]: string
	}
}

interface stakedResponse {
	[key: string]: string[]
}

const UnstakeNFTModal = (props: UnstakeNFTModalProps) => {
	const [stakedNFT, setStakedNFT] = useState<INFToken[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { accountId, viewFunction, signAndSendTransactions } = useWalletSelector()

	useEffect(() => {
		const getStakedNFT = async () => {
			stakedNFT.length === 0 && setIsLoading(true)
			if (accountId) {
				const resSC: stakedResponse = await viewFunction({
					receiverId: CONTRACT.FARM,
					methodName: 'list_user_nft_seeds',
					args: {
						account_id: accountId,
					},
				})

				if (resSC[props.seedId]) {
					const resBE: INFToken[] = await axios.all(resSC[props.seedId].map(fetchToken))
					setStakedNFT(resBE)
				}
			}
			setIsLoading(false)
		}

		const fetchToken = (scNft: string) => {
			const [contract_id, token_id] = scNft.split('@')
			const params = { token_id, contract_id }
			return cachios
				.get<{ data: { results: INFToken[] } }>(`${apiParasUrl}/token`, { params, ttl: 600 })
				.then((response) => response.data.data.results[0])
				.catch((error) => error)
		}

		if (props.show) {
			getStakedNFT()
		}
	}, [accountId, props.seedId, props.show, stakedNFT.length])

	const unstakeNFT = async (tokenId: string, contractId: string, unstakeAll = false) => {
		try {
			// const txs: {
			// 	receiverId: string
			// 	functionCalls: FunctionCallOptions[]
			// }[] = []
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

			if (unstakeAll) {
				stakedNFT.forEach((nft) => {
					txs.push({
						receiverId: CONTRACT.FARM,
						actions: [
							{
								type: 'FunctionCall',
								params: {
									methodName: 'withdraw_nft',
									args: {
										seed_id: props.seedId,
										nft_contract_id: nft.contract_id,
										nft_token_id: nft.token_id,
									},
									deposit: getAmount('1') as unknown as string,
									gas: getAmount(GAS_FEE[200]) as unknown as string,
								},
							},
						],
						signerId: CONTRACT.FARM,
					})
				})
			} else {
				txs.push({
					receiverId: CONTRACT.FARM,
					actions: [
						{
							type: 'FunctionCall',
							params: {
								methodName: 'withdraw_nft',
								args: {
									seed_id: props.seedId,
									nft_contract_id: contractId,
									nft_token_id: tokenId,
								},
								deposit: getAmount('1') as unknown as string,
								gas: getAmount(GAS_FEE[200]) as unknown as string,
							},
						},
					],
					signerId: CONTRACT.FARM,
				})
			}

			return await signAndSendTransactions({ transactions: txs })
		} catch (err) {
			console.log(err)
		}
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
						<p className="font-bold text-xl text-white">Unstake NFT</p>
						<p className="text-white text-sm -mt-1">{props.title}</p>
					</div>
					<div className="w-1/5" />
				</div>

				{hasReward(Object.values(props.claimableRewards)) && (
					<div className="font-semibold text-sm mt-2 text-center">
						Unstaking will claim the rewards to your wallet:
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
						{stakedNFT.length !== 0 ? (
							<div className="md:grid md:grid-cols-2 md:gap-4">
								{stakedNFT.map((nft) => (
									<NFTokenFarm
										key={nft._id}
										token={nft}
										stakeNFT={unstakeNFT}
										type="unstake"
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
								<p>{"You haven't staked any NFT for this Pool"}</p>
							</div>
						)}
					</div>
				)}

				{stakedNFT.length >= 2 && (
					<div className="text-right">
						<Button
							className="mt-4 px-8"
							color="blue-gray"
							onClick={() => unstakeNFT('', '', true)}
						>
							Unstake all NFT
						</Button>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default UnstakeNFTModal
