import ContractInfo from 'components/Common/ContractInfo'
import Modal from 'components/Common/Modal'
import NFTInfo from 'components/Common/NFTInfo'
import IconClose from 'components/Icon/IconClose'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

interface InfoModalProps {
	show: boolean
	nftPoints: {
		[key: string]: string
	}
	onClose: () => void
}

const FETCH_TOKENS_LIMIT = 20

const InfoModal = (props: InfoModalProps) => {
	const [tokens, setTokens] = useState<[string, string][]>([])
	const [page, setPage] = useState(0)
	const [hasMore, setHasMore] = useState(true)

	useEffect(() => {
		if (props.nftPoints) {
			fetchData()
		}
	}, [props.nftPoints])

	const fetchData = async () => {
		if (!hasMore) {
			return
		}

		setTokens(Object.entries(props.nftPoints).slice(0, (page + 1) * FETCH_TOKENS_LIMIT))
		setPage(page + 1)
		if (FETCH_TOKENS_LIMIT * page >= Object.keys(props.nftPoints).length) {
			setHasMore(false)
		} else {
			setHasMore(true)
		}
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm md:max-w-md w-full bg-parasGrey rounded-lg m-auto shadow-xl p-6 md:p-8 overflow-hidden">
				<div className="font-bold mb-4 flex gap-3 items-center text-xl relative">
					<div
						className="absolute right-0 top-0 -m-3 md:-m-4 cursor-pointer"
						onClick={props.onClose}
					>
						<IconClose />
					</div>
					<div>Eligible NFTs</div>
				</div>
				<div className="flex text-sm font-medium justify-between">
					<div>NFT</div>
					<div>Value</div>
				</div>

				<div
					id="scrollable-info-modal"
					className="h-[40vh] md:h-[50vh] overflow-y-auto no-scrollbar"
				>
					<InfiniteScroll
						dataLength={tokens.length}
						next={fetchData}
						hasMore={hasMore}
						loader={<div>Loading...</div>}
						scrollableTarget="scrollable-info-modal"
					>
						{tokens.map(([key, value], index) => {
							const [contract_id, token] = key.split(`@`)
							if (token) {
								const [token_series_id, token_id] = token.split(`::`)
								return (
									<NFTInfo
										key={index}
										contractId={contract_id}
										tokenSeriesId={token_series_id}
										tokenId={token_id}
										value={value}
									/>
								)
							}
							// For same token value in contract
							else {
								return <ContractInfo key={index} contractId={contract_id} value={value} />
							}
						})}
					</InfiniteScroll>
				</div>
			</div>
		</Modal>
	)
}

export default InfoModal
