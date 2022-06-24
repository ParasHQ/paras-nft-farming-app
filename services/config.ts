const CONTRACT_NAME = process.env.NEXT_PUBLIC_NFT_FARM_CONTRACT || 'near-blank-project'

type TRPCList = 'defaultRpc' | 'publicRpc'

export function getRPC(env: string) {
	switch (env) {
		case 'production':
		case 'mainnet':
			return {
				defaultRpc: {
					url: 'https://rpc.mainnet.near.orgi',
					simpleName: 'official rpc',
				},
				publicRpc: {
					url: 'https://public-rpc.blockpi.io/http/near',
					simpleName: 'blockpi rpc',
				},
			}

		case 'development':
		case 'testnet':
			return {
				defaultRpc: {
					url: 'https://rpc.testnet.near.org',
					simpleName: 'official rpc',
				},
				publicRpc: {
					url: 'https://public-rpc.blockpi.io/http/near-testnet',
					simpleName: 'blockpi rpc',
				},
			}

		default:
			return {
				defaultRpc: {
					url: 'https://rpc.mainnet.near.org',
					simpleName: 'official rpc',
				},
				publicRpc: {
					url: 'https://public-rpc.blockpi.io/http/near',
					simpleName: 'blockpi rpc',
				},
			}
	}
}

export default function getConfig(env: string) {
	const choosenRPC = (window.localStorage.getItem('choosenRPC') || 'defaultRpc') as TRPCList
	const nodeURL = getRPC(env)[choosenRPC].url

	switch (env) {
		case 'production':
		case 'mainnet':
			return {
				networkId: 'mainnet',
				nodeUrl: nodeURL,
				contractName: CONTRACT_NAME,
				walletUrl: 'https://wallet.near.org',
				helperUrl: 'https://helper.mainnet.near.org',
				explorerUrl: 'https://explorer.mainnet.near.org',
			}
		case 'development':
		case 'testnet':
			return {
				networkId: 'testnet',
				nodeUrl: nodeURL,
				contractName: CONTRACT_NAME,
				walletUrl: 'https://wallet.testnet.near.org',
				helperUrl: 'https://helper.testnet.near.org',
				explorerUrl: 'https://explorer.testnet.near.org',
			}
		case 'betanet':
			return {
				networkId: 'betanet',
				nodeUrl: 'https://rpc.betanet.near.org',
				contractName: CONTRACT_NAME,
				walletUrl: 'https://wallet.betanet.near.org',
				helperUrl: 'https://helper.betanet.near.org',
				explorerUrl: 'https://explorer.betanet.near.org',
			}
		case 'local':
			return {
				networkId: 'local',
				nodeUrl: 'http://localhost:3030',
				keyPath: `${process.env.HOME}/.near/validator_key.json`,
				walletUrl: 'http://localhost:4000/wallet',
				contractName: CONTRACT_NAME,
			}
		case 'test':
		case 'ci':
			return {
				networkId: 'shared-test',
				nodeUrl: 'https://rpc.ci-testnet.near.org',
				contractName: CONTRACT_NAME,
				masterAccount: 'test.near',
			}
		case 'ci-betanet':
			return {
				networkId: 'shared-test-staging',
				nodeUrl: 'https://rpc.ci-betanet.near.org',
				contractName: CONTRACT_NAME,
				masterAccount: 'test.near',
			}
		default:
			throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`)
	}
}
