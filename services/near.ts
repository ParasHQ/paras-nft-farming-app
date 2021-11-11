import { Near, keyStores, WalletConnection } from 'near-api-js'
import getConfig from './config'

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

	public nearFunctionCall({ methodName, args = {}, gas, amount, contractName }: IFunctionCall) {
		return this.wallet.account().functionCall({
			contractId: contractName,
			methodName,
			attachedDeposit: amount,
			args,
			gas,
		})
	}

	public nearViewFunction({ methodName, args, contractName }: IViewFunction) {
		return this.wallet.account().viewFunction(contractName, methodName, args)
	}
}

export default new NearClass()