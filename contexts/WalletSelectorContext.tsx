import React, { useCallback, useContext, useEffect, useState } from 'react'
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
import { CONTRACT } from 'utils/contract'
import { TSignAndSendTransaction, TSignAndSendTransactions, TViewFunction } from 'interfaces/wallet'
import { providers } from 'near-api-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import getConfig from 'services/config'
import { BN } from 'bn.js'

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
	accountId: string | null
	viewFunction: TViewFunction
	signAndSendTransaction: TSignAndSendTransaction
	signAndSendTransactions: TSignAndSendTransactions
	commonModal: TCommonModal
	setCommonModal: React.Dispatch<React.SetStateAction<TCommonModal>>
}

type TCommonModal = 'deposit' | null

const WalletSelectorContext = React.createContext<WalletSelectorContextValue | null>(null)

const nearConfig = getConfig(process.env.NEXT_PUBLIC_APP_ENV || 'development')

export const WalletSelectorContextProvider: React.FC = ({ children }) => {
	const [isInit, setIsInit] = useState(false)
	const [hasDeposit, setHasDeposit] = useState(false)
	const [commonModal, setCommonModal] = useState<TCommonModal>(null)
	const [selector, setSelector] = useState<WalletSelector | null>(null)
	const [modal, setModal] = useState<WalletSelectorModal | null>(null)
	const [accountId, setAccountId] = useState<string | null>(null)
	const [accounts, setAccounts] = useState<Array<AccountState>>([])

	const init = useCallback(async () => {
		const _selector = await setupWalletSelector({
			network: {
				networkId: nearConfig.networkId,
				nodeUrl: nearConfig.nodeUrl,
				helperUrl: nearConfig.helperUrl as string,
				explorerUrl: nearConfig.explorerUrl as string,
				indexerUrl: nearConfig.indexerUrl as string,
			},
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
	}, [])

	useEffect(() => {
		init().catch((err) => {
			console.error(err)
			alert('Failed to initialise wallet selector')
		})
	}, [init])

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
				setAccountId(accountId as string)
				setAccounts(nextAccounts)

				if (accountId) {
					checkStorageDeposit(accountId as string)
				}
			})

		return () => subscription.unsubscribe()
	}, [selector])

	const checkStorageDeposit = async (userId: string) => {
		if (userId) {
			const deposited = await viewFunction({
				receiverId: CONTRACT.FARM,
				methodName: 'storage_balance_of',
				args: {
					account_id: userId,
				},
			})
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const depositedTotal = parseFloat(formatNearAmount(deposited.total))
			deposited && depositedTotal >= 0.1 && setHasDeposit(true)
		}
	}

	const viewFunction: TViewFunction = ({ receiverId, methodName, args = '' }) => {
		return new providers.JsonRpcProvider({ url: nearConfig.nodeUrl })
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
		if (!selector) {
			return
		}
		const wallet = await selector.wallet()
		return wallet.signAndSendTransaction(params)
	}

	const signAndSendTransactions: TSignAndSendTransactions = async (params) => {
		if (!selector) {
			return
		}
		const wallet = await selector.wallet()
		return wallet.signAndSendTransactions(params)
	}

	if (!selector || !modal) {
		return null
	}

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
