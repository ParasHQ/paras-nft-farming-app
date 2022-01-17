import { Near, keyStores, WalletConnection } from 'near-api-js'
import getConfig from './config'
import BN from 'bn.js'
import { GAS_FEE } from 'constants/gasFee'
import { Action, createTransaction, functionCall } from 'near-api-js/lib/transaction'
import { PublicKey } from 'near-api-js/lib/utils'
import { base_decode } from 'near-api-js/lib/utils/serialize'
import { FunctionCallOptions } from 'near-api-js/lib/account'

interface IViewFunction {
	contractName: string
	methodName: string
	args?: {
		[key: string]: string | number | null
	}
}

interface IFunctionCall extends IViewFunction {
	gas?: string
	amount?: string
}

export const CONTRACT = {
	TOKEN: process.env.NEXT_PUBLIC_PARAS_TOKEN_CONTRACT || '',
	FARM: process.env.NEXT_PUBLIC_NFT_FARM_CONTRACT || '',
}

export const getAmount = (amount: string | null | undefined) =>
	amount ? new BN(amount) : new BN('0')

class NearClass {
	public near!: Near
	public wallet!: WalletConnection

	public init(callback?: () => void) {
		const config = getConfig(process.env.APP_ENV || 'development')
		const near = new Near({
			keyStore: new keyStores.BrowserLocalStorageKeyStore(),
			...config,
		})
		const wallet = new WalletConnection(near, 'paras-nft-farm')

		this.near = near
		this.wallet = wallet

		callback && callback()
	}

	public signIn() {
		this.wallet.requestSignIn('example-contract.testnet', 'Paras NFT Farm')
	}

	public signOut() {
		this.wallet.signOut()
		window.location.replace(window.location.origin + window.location.pathname)
	}

	public nearFunctionCall({
		methodName,
		args = {},
		gas = GAS_FEE[100],
		amount,
		contractName,
	}: IFunctionCall) {
		return this.wallet.account().functionCall({
			contractId: contractName,
			methodName,
			attachedDeposit: getAmount(amount),
			gas: getAmount(gas),
			args,
		})
	}

	public nearViewFunction({ methodName, args, contractName }: IViewFunction) {
		return this.wallet.account().viewFunction(contractName, methodName, args)
	}

	async createTransaction({
		receiverId,
		actions,
		nonceOffset = 1,
	}: {
		receiverId: string
		actions: Action[]
		nonceOffset?: number
	}) {
		const localKey = await this.near.connection.signer.getPublicKey(
			this.wallet.account().accountId,
			this.near.connection.networkId
		)
		const accessKey = await this.wallet
			.account()
			.accessKeyForTransaction(receiverId, actions, localKey)
		if (!accessKey) {
			throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`)
		}

		const block = await this.near.connection.provider.block({ finality: 'final' })
		const blockHash = base_decode(block.header.hash)

		const publicKey = PublicKey.from(accessKey.public_key)
		const nonce = accessKey.access_key.nonce + nonceOffset

		return createTransaction(
			this.wallet.account().accountId,
			publicKey,
			receiverId,
			nonce,
			actions,
			blockHash
		)
	}

	public async executeMultipleTransactions(
		transactions: {
			receiverId: string
			functionCalls: FunctionCallOptions[]
		}[],
		callbackUrl?: string
	) {
		const nearTransactions = await Promise.all(
			transactions.map((t, i) => {
				return this.createTransaction({
					receiverId: t.receiverId,
					nonceOffset: i + 1,
					actions: t.functionCalls.map((fc) =>
						functionCall(fc.methodName, fc.args, fc.gas as BN, fc.attachedDeposit as BN)
					),
				})
			})
		)

		return this.wallet.requestSignTransactions(nearTransactions, callbackUrl)
	}
}

export default new NearClass()
