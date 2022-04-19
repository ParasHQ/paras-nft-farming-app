import Button from 'components/Common/Button'
import Head from 'components/Common/Head'
import Header from 'components/Common/Header'
import Loader from 'components/Common/Loader'
import DelegateTokenModal from 'components/Modal/DelegateModal'
import UndelegateTokenModal from 'components/Modal/UndelegateModal'
import ProposalVote from 'components/Proposal/ProposalVote'
import VotesPeople from 'components/Proposal/VotesPeople'
import { useNearProvider } from 'hooks/useNearProvider'
import { IProposal } from 'interfaces/proposal'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { formatParasAmount, prettyBalance } from 'utils/common'

type TShowModal = 'delegate' | 'undelegate' | null

const ProposalItemDetail = () => {
	const [proposal, setProposal] = useState<IProposal>()
	const [delegationBalance, setDelegationBalance] = useState<number>(0)
	const [hasRegister, setHasRegister] = useState(false)
	const [showModal, setShowModal] = useState<TShowModal>(null)

	const { accountId, setCommonModal, hasDeposit } = useNearProvider()
	const router = useRouter()

	const startTime = new Date((proposal?.proposal.proposal_start_time || 0) / 10 ** 6)
	const endTime = new Date(
		startTime.getTime() + (proposal?.proposal.proposal_period || 0) / 10 ** 6
	)

	useEffect(() => {
		const getProposal = async () => {
			const proposalDetail = await near.nearViewFunction({
				contractName: CONTRACT.DAO,
				methodName: 'get_proposal',
				args: {
					id: parseInt(router.query.id as string),
				},
			})

			setProposal(proposalDetail)
		}

		if (router.query.id) {
			getProposal()
		}
	}, [router.query.id])

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

	if (!proposal) {
		return (
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Loader isLoading={true} />
				<div className="relative z-50">
					<Header />
				</div>
			</div>
		)
	}

	const onClickDelegate = (type: TShowModal) => {
		console.log('onclickk')
		if (!accountId) {
			setCommonModal('login')
			return
		}

		if (!hasDeposit) {
			setCommonModal('deposit')
			return
		}

		setShowModal(type)
	}

	return (
		<>
			<Head />
			<div className="bg-gray-900 min-h-screen pb-16 lg:pb-0">
				<Header />
				<DelegateTokenModal
					show={showModal === 'delegate'}
					onClose={() => setShowModal(null)}
					hasRegister={hasRegister}
				/>
				<UndelegateTokenModal
					show={showModal === 'undelegate'}
					onClose={() => setShowModal(null)}
					delegationBalance={delegationBalance}
				/>
				<div className="max-w-5xl w-full mx-auto px-4">
					<div className="md:flex md:gap-6 mt-8">
						<div className="md:w-3/5 text-white">
							<div className="flex items-center gap-2 text-white text-opacity-70 mb-4 text-sm">
								<Link href="/proposal">
									<a>Proposal</a>
								</Link>
								<p>{'>'}</p>
								<p>{proposal.proposal.title}</p>
							</div>
							<p className="font-bold text-3xl">{proposal.proposal.title}</p>
							<p>by {proposal.proposal.proposer}</p>
							<p className="my-8 text-white text-opacity-80">{proposal.proposal.description}</p>
							<hr className="my-8" />
							<div className="flex justify-between">
								<div className="text-lg">
									In voting contract: {prettyBalance(formatParasAmount(delegationBalance), 0)} PARAS
								</div>
								<div className="flex gap-2">
									<div>
										<Button onClick={() => onClickDelegate('delegate')} className="px-6" size="md">
											Deposit
										</Button>
									</div>
									<div>
										<Button
											onClick={() => onClickDelegate('undelegate')}
											className="px-6"
											size="md"
											color="blue-gray"
										>
											Withdraw
										</Button>
									</div>
								</div>
							</div>

							<ProposalVote
								id={router.query.id as string}
								options={proposal.proposal.kind.Vote.vote_options}
								delegationBalance={delegationBalance}
								userVotes={proposal.proposal.votes[accountId || '']}
							/>

							<div className="text-white py-4 my-6">
								<p className="text-xl font-bold mb-2">Votes</p>
								<div className="flex justify-between items-end text-white text-opacity-80 text-sm">
									<div className="w-2/5">
										<p>Account</p>
									</div>
									<div className="w-1/5 text-right mx-2">
										<p>Option</p>
									</div>
									<div className="w-1/6 text-right mx-2">
										<p>Voting Power</p>
									</div>
									<div className="w-1/5 text-right">
										<p>Staked Paras</p>
									</div>
								</div>
								{Object.keys(proposal.proposal.votes).map((key) => {
									const user = proposal.proposal.votes[key]
									const percentage =
										(parseInt(formatParasAmount(user.user_weight)) /
											parseInt(formatParasAmount(proposal.proposal.total_vote_counts))) *
										100
									return (
										<VotesPeople
											key={key}
											option={user.vote_option}
											userId={key}
											percentage={percentage.toFixed(2)}
											weight={user.user_weight}
										/>
									)
								})}
							</div>
						</div>

						<div className="md:w-2/5">
							<div className="text-white p-4 rounded-md shadow-xl bg-parasGrey">
								<p className="text-xl font-bold mb-2">Information</p>
								<div className="flex justify-between">
									<p className="font-medium">Voting System</p>
									<p className="text-white text-opacity-80">Single choice voting</p>
								</div>
								<div className="flex justify-between">
									<p className="font-medium">Start date</p>
									<p className="text-white text-opacity-80">{startTime.toUTCString()}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-medium">End date</p>
									<p className="text-white text-opacity-80">{endTime.toUTCString()}</p>
								</div>
							</div>

							<div className="mt-4 text-white p-4 rounded-md shadow-xl bg-parasGrey">
								<p className="text-xl font-bold">Current Result</p>
								{Object.keys(proposal.proposal.vote_counts).map((key) => {
									const optionWeight = proposal.proposal.vote_counts[key]
									const percentage = (
										(parseInt(formatParasAmount(optionWeight)) /
											parseInt(formatParasAmount(proposal.proposal.total_vote_counts))) *
										100
									).toFixed(2)

									return (
										<div className="mt-3" key={key}>
											<div className="flex justify-between">
												<p className="text-white text-opacity-80 capitalize">{key}</p>
												<p className="text-white text-opacity-80 text-right">
													{prettyBalance(formatParasAmount(optionWeight), 0)} PARAS ({percentage}%)
												</p>
											</div>
											<div className="mt-2 relative w-full h-[0.45rem] rounded-md bg-gray-200 overflow-hidden">
												<div
													className="absolute h-full bg-blueButton"
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									)
								})}
							</div>

							<div className="mt-4 text-white p-4 rounded-md shadow-xl bg-parasGrey">
								<p className="text-xl font-bold mb-2">Voting Stats</p>
								<div className="flex justify-between">
									<p className="font-medium">Total Votes</p>
									<p className="text-white text-opacity-80">
										{prettyBalance(formatParasAmount(proposal.proposal.total_vote_counts), 0)} PARAS
									</p>
								</div>
								<div className="flex justify-between">
									<p className="font-medium">Unique Voters</p>
									<p className="text-white text-opacity-80">
										{Object.keys(proposal.proposal.votes).length}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default ProposalItemDetail
