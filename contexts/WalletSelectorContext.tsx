import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { map, distinctUntilChanged } from 'rxjs'
import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core'
import type { WalletSelector, AccountState } from '@near-wallet-selector/core'
import { setupModal } from '@near-wallet-selector/modal-ui'
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui'
import { setupNearWallet } from '@near-wallet-selector/near-wallet'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupSender } from '@near-wallet-selector/sender'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import Loader from 'components/Common/Loader'
import DepositModal from 'components/Modal/DepositModal'
import near from 'services/near'
import { TSignAndSendTransaction, TSignAndSendTransactions, TViewFunction } from 'interfaces/wallet'
import { providers } from 'near-api-js'
import getConfig from 'services/config'
import { CONTRACT } from 'utils/contract'
import { BN } from 'bn.js'
import { CodeResult } from 'near-api-js/lib/providers/provider'

declare global {
	interface Window {
		selector: WalletSelector
		modal: WalletSelectorModal
	}
}

interface WalletSelectorContextValue {
	isInit: boolean
	hasDeposit: boolean
	selector: WalletSelector | undefined
	modal: WalletSelectorModal | undefined
	accounts: Array<AccountState>
	accountId: string | undefined
	viewFunction: TViewFunction
	signAndSendTransaction: TSignAndSendTransaction
	signAndSendTransactions: TSignAndSendTransactions
	commonModal: TCommonModal
	setCommonModal: React.Dispatch<React.SetStateAction<TCommonModal>>
}

type TCommonModal = 'deposit' | null

const defaultValue: WalletSelectorContextValue = {
	isInit: false,
	hasDeposit: false,
	accountId: null,
	commonModal: null,
	setCommonModal: () => null,
} as any

export const getAmount = (amount: string | null | undefined) =>
	amount ? new BN(amount) : new BN('0')

const WalletSelectorContext = createContext<WalletSelectorContextValue | null>(null)

interface WalletSelectorContextProviderProps {
	children: React.ReactNode
}

const nearConfig = getConfig(process.env.NEXT_PUBLIC_APP_ENV || 'development')

export const WalletSelectorContextProvider = ({ children }: WalletSelectorContextProviderProps) => {
	const [isInit, setIsInit] = useState<boolean>(false)
	const [hasDeposit, setHasDeposit] = useState<boolean>(false)
	const [commonModal, setCommonModal] = useState<TCommonModal>(null)
	const [selector, setSelector] = useState<WalletSelector>()
	const [modal, setModal] = useState<WalletSelectorModal>()
	const [accounts, setAccounts] = useState<Array<AccountState>>([])
	const [accountId, setAccountId] = useState<string>()

	const init = async () => {
		const _selector = await setupWalletSelector({
			network: nearConfig.networkId as unknown as NetworkId,
			debug: true,
			modules: [setupNearWallet(), setupMyNearWallet(), setupSender(), setupMeteorWallet()],
		})
		const _modal = setupModal(_selector, {
			contractId: CONTRACT.FARM,
		})
		const state = _selector.store.getState()
		setAccounts(state.accounts)

		window.selector = _selector
		window.modal = _modal

		setSelector(_selector)
		setModal(_modal)

		setIsInit(true)

		// near.init(async () => {
		// 	checkStorageDeposit()
		// 	setIsInit(true)
		// })
	}

	useEffect(() => {
		init().catch((err) => {
			console.error(err)
			alert('Failed to initialise wallet selector')
		})
	}, [])

	useEffect(() => {
		if (!selector) {
			return
		}

		const subscription = selector.store.observable
			.pipe(
				map((state) => state.accounts),
				distinctUntilChanged()
			)
			.subscribe((nextAccounts) => {
				const accountId = nextAccounts.find((account) => account.active)?.accountId
				setAccountId(accountId)
				setAccounts(nextAccounts)
			})

		return () => subscription.unsubscribe()
	}, [selector])

	// if (!selector || !modal) {
	// 	return null
	// }

	const viewFunction: TViewFunction = ({ receiverId, methodName, args = '' }) => {
		console.log('nearConfig.nodeUrl', nearConfig.nodeUrl)
		return new providers.JsonRpcProvider({ url: nearConfig.nodeUrl } as unknown as string)
			.query({
				request_type: 'call_function',
				account_id: receiverId,
				method_name: methodName,
				args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
				finality: 'optimistic',
			})
			.then((res) =>
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				JSON.parse(Buffer.from(res.result).toString())
			)
	}

	const signAndSendTransaction: TSignAndSendTransaction = async (params) => {
		if (!selector) return

		const wallet = await selector.wallet()
		return wallet.signAndSendTransaction(params)
	}

	const signAndSendTransactions: TSignAndSendTransactions = async (params) => {
		if (!selector) return

		const wallet = await selector.wallet()
		return wallet.signAndSendTransactions(params)
	}

	// const checkStorageDeposit = async () => {
	// 	// const userId = near.wallet.getAccountId()
	// 	const userId = accountId
	// 	console.log('userIdNew', accountId)

	// 	if (userId) {
	// 		const deposited = await viewFunction({
	// 			receiverId: CONTRACT.FARM,
	// 			methodName: 'storage_balance_of',
	// 			args: {
	// 				account_id: userId,
	// 			},
	// 		})
	// 		deposited && setHasDeposit(true)
	// 	}
	// }

	console.log('userIdNew=>', accountId)

	return (
		<WalletSelectorContext.Provider
			value={{
				isInit,
				hasDeposit,
				selector,
				modal,
				accounts,
				accountId,
				viewFunction,
				signAndSendTransaction,
				signAndSendTransactions,
				commonModal,
				setCommonModal,
			}}
		>
			<Loader isLoading={!isInit} />
			{children}
			<DepositModal show={commonModal === 'deposit'} onClose={() => setCommonModal(null)} />
		</WalletSelectorContext.Provider>
	)
}

export function useWalletSelector() {
	const context = useContext(WalletSelectorContext)

	if (!context) {
		throw new Error('useWalletSelector must be used within a WalletSelectorContextProvider')
	}

	return context
}
