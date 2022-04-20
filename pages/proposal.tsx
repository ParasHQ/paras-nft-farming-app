import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import IconClock from 'components/Icon/IconClock'
import { IProposal } from 'interfaces/proposal'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import Link from 'next/link'
import { useNearProvider } from 'hooks/useNearProvider'
import { formatParasAmount, getTimeRemaining, prettyBalance } from 'utils/common'
import Button from 'components/Common/Button'
import DelegateTokenModal from 'components/Modal/DelegateModal'
import UndelegateTokenModal from 'components/Modal/UndelegateModal'
import { TShowModal } from './proposal/[id]'

const Proposal = () => {
	const [proposals, setProposals] = useState<IProposal[]>([])
	const [delegationBalance, setDelegationBalance] = useState<number>(0)
	const [hasRegister, setHasRegister] = useState(false)
	const [showModal, setShowModal] = useState<TShowModal>(null)
	const { isInit, accountId } = useNearProvider()

	useEffect(() => {
		const getProposals = async () => {
			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposals',
				args: {
					from_index: 0,
					limit: 10,
				},
			})

			setProposals(proposalDetail)
		}
		if (isInit) {
			getProposals()
		}
	}, [isInit])

	useEffect(() => {
		const getDelegation = async () => {
			try {
				const delegationBalance = await near.nearViewFunction({
					contractName: CONTRACT.DAO,
					methodName: 'delegation_balance_of',
					args: {
						account_id: accountId,
					},
				})
				setDelegationBalance(delegationBalance)
				setHasRegister(true)
			} catch (error) {
				console.log(error)
			}
		}

		if (accountId) {
			getDelegation()
		}
	}, [accountId])

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<DelegateTokenModal
					show={showModal === 'delegate'}
					onClose={() => setShowModal(null)}
					hasRegister={hasRegister}
					delegationBalance={delegationBalance}
				/>
				<UndelegateTokenModal
					show={showModal === 'undelegate'}
					onClose={() => setShowModal(null)}
					delegationBalance={delegationBalance}
				/>
				<div className="mt-4 max-w-3xl px-4 mx-auto pb-12">
					<div className="flex justify-between mb-4">
						<div className="text-lg text-white text-opacity-80">
							Your voting power:{' '}
							<span className="font-bold text-white text-opacity-100">
								{prettyBalance(formatParasAmount(10000000000000000000), 0)} PARAS
							</span>
						</div>
						<div className="flex gap-2">
							<div>
								<Button onClick={() => setShowModal('delegate')} className="px-6 w-28" size="md">
									Add
								</Button>
							</div>
							<div>
								<Button
									onClick={() => setShowModal('undelegate')}
									className="px-6 w-28"
									size="md"
									color="blue-gray"
								>
									Remove
								</Button>
							</div>
						</div>
					</div>
					<p className="my-4 font-bold text-2xl text-white">Proposal</p>
					{proposals.map((proposal) => (
						<ProposalItem key={proposal.id} data={proposal} />
					))}
				</div>
			</div>
		</>
	)
}

const ProposalItem = ({ data }: { data: IProposal }) => {
	const { accountId } = useNearProvider()
	const userVotes = data.proposal.votes[accountId || '']

	const startTime = new Date((data.proposal.proposal_start_time || 0) / 10 ** 6)
	const endTime = new Date(startTime.getTime() + (data.proposal.proposal_period || 0) / 10 ** 6)

	const { hours, days } = getTimeRemaining(endTime.getTime())

	const importantText = () => {
		const startTime = new Date((data.proposal.proposal_start_time || 0) / 10 ** 6)
		const isNotStarted = startTime.getTime() > Date.now()

		if (data.proposal.status === 'InProgress') {
			if (isNotStarted) {
				return 'Coming Soon'
			} else {
				return userVotes ? `You voted ${userVotes.vote_option}` : 'You have not voted'
			}
		} else if (data.proposal.status.Finalized) {
			const winnerOption = data.proposal.status.Finalized.vote_option_winner
			const parasCountWinner = data.proposal.vote_counts[winnerOption]
			return (
				<>
					<p>Results:</p>
					<p>
						{`${winnerOption} - ${prettyBalance(formatParasAmount(parasCountWinner), 0)} PARAS`}
					</p>
				</>
			)
		} else if (data.proposal.status === 'Approved') {
			return 'Approved'
		} else if (data.proposal.status === 'Rejected') {
			return 'Rejected'
		} else {
			return 'Ended'
		}
	}

	return (
		<Link href={`/proposal/${data.id}`}>
			<a>
				<div className="text-white p-6 rounded-xl shadow-xl bg-parasGrey relative mb-6 cursor-pointer">
					<p className="font-bold text-2xl">{data.proposal.title}</p>
					<p className="truncate">by {data.proposal.proposer}</p>
					<p className="my-6 text-white text-opacity-80">{data.proposal.description}</p>
					<div className="md:flex flex-row-reverse justify-between items-end">
						<div className="mb-2 md:mb-0 flex items-center gap-2">
							<IconClock color={data.proposal.status === 'InProgress' ? '#4FA59E' : '#ffffff'} />
							<p className={`${data.proposal.status === 'InProgress' ? 'text-[#4FA59E]' : ''}`}>
								{data.proposal.status === 'InProgress' ? `${days}D ${hours}H Remaining` : `Ended`}
							</p>
						</div>
						<div className="italic font-bold text-blueButton">{importantText()}</div>
					</div>
				</div>
			</a>
		</Link>
	)
}

export default Proposal
