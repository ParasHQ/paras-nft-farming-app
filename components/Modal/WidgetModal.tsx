import * as React from 'react'
import { init_env, SwapWidget, Transaction, WalletSelectorTransactions } from '@ref-finance/ref-sdk'
import { NotLoginError } from '@ref-finance/ref-sdk'
import Modal from 'components/Common/Modal'
import { Theme } from '@ref-finance/ref-sdk/dist/swap-widget/constant'
import { useState, useEffect } from 'react'
import { useWalletSelector } from 'contexts/WalletSelectorContext'
import { GAS_FEE } from 'constants/gasFee'

export const defaultDarkModeTheme: Theme = {
	container: '#26343E',
	buttonBg: '#00C6A2',
	primary: '#FFFFFF',
	secondary: '#7E8A93',
	borderRadius: '4px',
	fontFamily: 'sans-serif',
	hover: 'rgba(126, 138, 147, 0.2)',
	active: 'rgba(126, 138, 147, 0.2)',
	secondaryBg: 'rgba(0, 0, 0, 0.2)',
	borderColor: 'rgba(126, 138, 147, 0.2)',
	iconDefault: '#7E8A93',
	iconHover: '#B7C9D6',
	refIcon: 'white',
}

init_env(process.env.NEXT_PUBLIC_APP_ENV || 'testnet')

interface SwapWidgetProps {
	show: boolean
	setShowSwapModal: (show: boolean) => void
	onClose: () => void
}

export const Widget = (props: SwapWidgetProps) => {
	const { modal, selector, accountId, viewFunction } = useWalletSelector()

	const [swapState, setSwapState] = useState<'success' | 'fail' | null>(null)
	const [tx, setTx] = useState<string | undefined>(undefined)

	useEffect(() => {
		const errorCode = new URLSearchParams(window.location.search).get('errorCode')

		const transactions = new URLSearchParams(window.location.search).get('transactionHashes')

		const from = new URLSearchParams(window.location.search).get('from')

		const lastTX = transactions?.split(',').pop()

		setTx(lastTX)

		if (lastTX && from === 'swap') {
			props.setShowSwapModal(true)
			setSwapState(errorCode ? 'fail' : lastTX ? 'success' : null)
			window.history.replaceState({}, '', window.location.origin + window.location.pathname)
		}
	}, [])

	const onSwap = async (transactionsRef: Transaction[]) => {
		if (!accountId) throw NotLoginError
		const referralId = 'team.paras.near'

		const wallet = await selector?.wallet()
		const transactionsRegister: Transaction[] = []

		for (const tx of transactionsRef) {
			for (const x of tx.functionCalls) {
				if (x.methodName === 'ft_transfer_call') {
					const args: any = x.args
					const parsedMsg = JSON.parse(args.msg)

					if (parsedMsg.actions && parsedMsg.actions.length > 0) {
						for (const act of parsedMsg.actions) {
							const poolId = `:${act.pool_id}`

							const hasRegistered = await viewFunction({
								receiverId: args.receiver_id,
								methodName: 'mft_has_registered',
								args: {
									token_id: poolId,
									account_id: referralId,
								},
							})

							if (!hasRegistered) {
								transactionsRegister.push({
									receiverId: args.receiver_id,
									functionCalls: [
										{
											methodName: 'mft_register',
											args: {
												token_id: poolId,
												account_id: referralId,
											},
											amount: '0.01',
											gas: GAS_FEE[30],
										},
									],
								})
							}
						}
					}

					parsedMsg['referral_id'] = referralId
					const stringifiedMsg = JSON.stringify(parsedMsg)
					args['msg'] = stringifiedMsg
					x.args = args
				}
			}
		}

		const newTransactionsRef = transactionsRegister.concat(transactionsRef)
		wallet?.signAndSendTransactions({
			transactions: WalletSelectorTransactions(newTransactionsRef, accountId).transactions,
			callbackUrl: window.location.origin + window.location.pathname + '?from=swap',
		})
	}

	const onConnect = () => {
		modal?.show()
	}

	const onDisConnect = async () => {
		const wallet = await selector?.wallet()
		return await wallet?.signOut()
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose} closeOnEscape={true} closeOnBgClick={true}>
			<SwapWidget
				theme={defaultDarkModeTheme}
				onSwap={onSwap}
				onDisConnect={onDisConnect}
				width={'400px'}
				connection={{
					AccountId: accountId || '',
					isSignedIn: !!accountId,
				}}
				transactionState={{
					state: swapState,
					setState: setSwapState,
					tx,
				}}
				enableSmartRouting={true}
				onConnect={onConnect}
				defaultTokenIn={process.env.NEXT_PUBLIC_WRAP_NEAR_CONTRACT}
				defaultTokenOut={process.env.NEXT_PUBLIC_PARAS_TOKEN_CONTRACT}
				className="mx-auto"
			/>
		</Modal>
	)
}

export default Widget
