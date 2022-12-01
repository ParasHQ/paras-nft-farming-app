import { Action, Optional, Transaction } from '@near-wallet-selector/core'
import {
	BrowserWalletSignAndSendTransactionParams,
	BrowserWalletSignAndSendTransactionsParams,
} from '@near-wallet-selector/core/lib/wallet'
import { providers } from 'near-api-js'

export type TSignAndSendTransaction = (
	params: BrowserWalletSignAndSendTransactionParams
) => Promise<void | providers.FinalExecutionOutcome>

export type TSignAndSendTransactions = (
	params: BrowserWalletSignAndSendTransactionsParams
) => Promise<void | providers.FinalExecutionOutcome[]>

export interface SignAndSendTransactionsRamperProps {
	receiverId?: string
	actions?: Action[]
	transactions?: Optional<Transaction, 'signerId'>[]
}

export type TViewFunction = <T>(params: {
	receiverId: string
	methodName: string
	args: unknown
}) => Promise<T>
