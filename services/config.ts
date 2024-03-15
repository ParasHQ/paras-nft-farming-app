const CONTRACT_NAME = process.env.NEXT_PUBLIC_NFT_FARM_CONTRACT || 'near-blank-project'

export default function getConfig(env: string) {
	switch (env) {
		case 'production':
		case 'mainnet':
			return {
				networkId: 'mainnet',
				nodeUrl: 'https://rpc.mainnet.near.org',
				contractName: CONTRACT_NAME,
				walletUrl: 'https://wallet.near.org',
				helperUrl: 'https://helper.mainnet.near.org',
				explorerUrl: 'https://explorer.mainnet.near.org',
				WRAP_NEAR_CONTRACT_ID: 'wrap.near',
				REF_FI_CONTRACT_ID: 'v2.ref-finance.near',
				REF_TOKEN_ID: 'token.v2.ref-finance.near',
				indexerUrl: 'https://indexer.ref.finance',
				REF_DCL_SWAP_CONTRACT_ID: '',
			}
		case 'development':
		case 'testnet':
			return {
				networkId: 'testnet',
				nodeUrl: 'https://rpc.testnet.near.org',
				contractName: CONTRACT_NAME,
				walletUrl: 'https://wallet.testnet.near.org',
				helperUrl: 'https://helper.testnet.near.org',
				explorerUrl: 'https://explorer.testnet.near.org',
				indexerUrl: 'https://testnet-indexer.ref-finance.com',
				WRAP_NEAR_CONTRACT_ID: 'wrap.testnet',
				REF_FI_CONTRACT_ID: 'ref-finance-101.testnet',
				REF_TOKEN_ID: 'ref.fakes.testnet',
				REF_DCL_SWAP_CONTRACT_ID: 'dcl.ref-dev.testnet',
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
