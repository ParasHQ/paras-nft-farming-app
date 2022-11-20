import React, { useCallback, useContext, useEffect, useState } from 'react'
import { map, distinctUntilChanged } from 'rxjs'
import { setupWalletSelector } from '@near-wallet-selector/core'
import type { WalletSelector, AccountState } from '@near-wallet-selector/core'
import { setupModal } from '@near-wallet-selector/modal-ui'
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui'
import { setupNearWallet } from '@near-wallet-selector/near-wallet'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupSender } from '@near-wallet-selector/sender'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import Loader from 'components/Common/Loader'
import DepositModal from 'components/Modal/DepositModal'
import near, { CONTRACT } from 'services/near'

declare global {
	interface Window {
		selector: WalletSelector
		modal: WalletSelectorModal
	}
}

interface WalletSelectorContextValue {
	isInit: boolean
	hasDeposit: boolean
	selector: WalletSelector
	modal: WalletSelectorModal
	accounts: Array<AccountState>
	accountId: string | null
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

const WalletSelectorContext = React.createContext<WalletSelectorContextValue | null>(defaultValue)

export const WalletSelectorContextProvider: React.FC = ({ children }) => {
	const [isInit, setIsInit] = useState(false)
	const [hasDeposit, setHasDeposit] = useState(false)
	const [commonModal, setCommonModal] = useState<TCommonModal>(null)
	const [selector, setSelector] = useState<WalletSelector | null>(null)
	const [modal, setModal] = useState<WalletSelectorModal | null>(null)
	const [accounts, setAccounts] = useState<Array<AccountState>>([])
	const accountId = accounts.find((account) => account.active)?.accountId || null

	const init = useCallback(async () => {
		const _selector = await setupWalletSelector({
			network: process.env.NEXT_PUBLIC_APP_ENV as any,
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

		near.init(async () => {
			checkStorageDeposit()
			setIsInit(true)
		})
	}, [])

	const checkStorageDeposit = async () => {
		const userId = near.wallet.getAccountId()

		if (userId) {
			const deposited = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: 'storage_balance_of',
				args: {
					account_id: userId,
				},
			})
			deposited && setHasDeposit(true)
		}
	}

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
				console.log('Accounts Update', nextAccounts)

				setAccounts(nextAccounts)
			})

		return () => subscription.unsubscribe()
	}, [selector])

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
