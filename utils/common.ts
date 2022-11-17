import JSBI from 'jsbi'
import CID from 'cids'
import crypto from 'crypto'
import { GOLD, PLATINUM, SILVER } from 'constants/royaltyLevel'
import { PARAS_NOMINATION_EXP } from 'constants/common'
import { getAmount } from 'services/near'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { Transaction } from '@ref-finance/ref-sdk'

interface IParseImgOpts {
	useOriginal?: boolean
	width?: string
	isMediaCdn?: boolean
}

export const toHumanReadableNumbers = (val: string) => {
	const PREFIXES: { [key: string]: string } = {
		'24': 'Y',
		'21': 'Z',
		'18': 'E',
		'15': 'P',
		'12': 'T',
		'9': 'G',
		'6': 'M',
		'3': 'k',
		'0': '',
		'-3': 'm',
		'-6': 'µ',
		'-9': 'n',
		'-12': 'p',
		'-15': 'f',
		'-18': 'a',
		'-21': 'z',
		'-24': 'y',
	}

	function getExponent(n: number) {
		if (n === 0) {
			return 0
		}
		return Math.floor(Math.log10(Math.abs(n)))
	}

	function precise(n: number) {
		return Number.parseFloat(n.toPrecision(3))
	}

	function toHumanString(sn: string) {
		const n = precise(Number.parseFloat(sn))
		const e = Math.max(Math.min(3 * Math.floor(getExponent(n) / 3), 24), -24)
		return precise(n / Math.pow(10, e)).toString() + PREFIXES[e]
	}

	return toHumanString(val)
}

export const prettyBalance = (balance: string, decimals = 18, len = 8) => {
	if (!balance) {
		return '0'
	}
	const fixedBalance = (Number(balance) / 10 ** decimals).toFixed(len)
	const finalBalance = parseFloat(fixedBalance).toString()
	const [head, tail] = finalBalance.split('.')
	if (head === '0') {
		if (tail) {
			return `${head}.${tail.substring(0, len - 1)}`
		}
		return `${head}`
	}

	if (head.length > len) {
		const tailRequired = len - head.length
		const formattedHead = head.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

		if (tail && tailRequired > 0) {
			return `${formattedHead}.${tail.substring(0, tailRequired)}`
		}
		return `${formattedHead}`
	}

	const formattedHead = head.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return tail ? `${formattedHead}.${tail}` : formattedHead
}

export const formatParasAmount = (balance: string | number) => {
	return JSBI.divide(JSBI.BigInt(balance), JSBI.BigInt(10 ** 18)).toString()
}

export const parseParasAmount = (balance: string | number) => {
	const splitted = (balance as string).split('.')
	const wholePart = splitted[0]
	let numof0
	const fracPart = splitted[1]?.replace(/^0+/g, '') || ''
	if (/^0+/.test(splitted[1])) {
		numof0 = splitted[1].match(/^0+/g)?.[0].length
	}
	return (
		(wholePart === '0' ? '' : wholePart) +
		fracPart?.padEnd(numof0 ? PARAS_NOMINATION_EXP - numof0 : PARAS_NOMINATION_EXP, '0')
	)
}

export const parseImgUrl = (url: string, defaultValue = '', opts: IParseImgOpts = {}) => {
	if (!url) {
		return defaultValue
	}
	if (url.includes('://')) {
		const [protocol, path] = url.split('://')
		if (protocol === 'ipfs') {
			const cid = new CID(path)
			if (opts.useOriginal || process.env.NEXT_PUBLIC_APP_ENV !== 'mainnet') {
				if (cid.version === 0) {
					return `https://ipfs-gateway.paras.id/ipfs/${path}`
				} else {
					return `https://ipfs.fleek.co/ipfs/${path}`
				}
			}

			const transformationList = []
			if (opts.width) {
				transformationList.push(`w=${opts.width}`)
			} else {
				transformationList.push('w=400')
			}
			return `https://paras-cdn.imgix.net/${cid}?${transformationList.join('&')}`
		} else if (opts.isMediaCdn) {
			const sha1Url = sha1(url)
			const transformationList = []
			if (opts.width) {
				transformationList.push(`w=${opts.width}`)
			} else {
				transformationList.push('w=400')
			}
			return `https://paras-cdn.imgix.net/${sha1Url}?${transformationList.join('&')}`
		}
		return url
	} else {
		try {
			const cid = new CID(url)
			if (opts.useOriginal || process.env.NEXT_PUBLIC_APP_ENV !== 'mainnet') {
				if (cid.version === 0) {
					return `https://ipfs-gateway.paras.id/ipfs/${cid}`
				} else if (cid.version === 1) {
					return `https://ipfs.fleek.co/ipfs/${cid}`
				}
			}

			const transformationList = []
			if (opts.width) {
				transformationList.push(`w=${opts.width}`)
			} else {
				transformationList.push('w=400')
			}
			return `https://paras-cdn.imgix.net/${cid}?${transformationList.join('&')}`
		} catch (err) {
			return url
		}
	}
}

export default function sha1(data: crypto.BinaryLike, encoding = 'hex') {
	return (
		crypto
			.createHash('sha1')
			.update(data)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.digest(encoding as any)
	)
}

export const prettyTruncate = (str: string | null = '', len = 8, type: string) => {
	if (str && str.length > len) {
		if (type === 'address') {
			const front = Math.ceil(len / 2)
			const back = str.length - (len - front)
			return `${str.slice(0, front)}...${str.slice(back)}`
		}
		return `${str.slice(0, len)}...`
	}
	return str
}

export const hasReward = (rewards: string[]) => {
	const rewardIdx = rewards.findIndex((val) => {
		return JSBI.greaterThan(JSBI.BigInt(val), JSBI.BigInt(0))
	})
	return rewardIdx > -1 ? true : false
}

export const currentMemberLevel = (value: number) => {
	if (value < SILVER) {
		return 'Bronze'
	} else if (value >= SILVER && value < GOLD) {
		return 'Silver'
	} else if (value >= GOLD && value < PLATINUM) {
		return 'Gold'
	} else if (value >= PLATINUM) {
		return 'Platinum'
	}
}

export const parseTransactionRef = (transactionsRef: Transaction[]) => {
	transactionsRef.map((transaction) => {
		transaction.functionCalls.map((t: any) => {
			t.contractId = transaction.receiverId
			t.attachedDeposit = getAmount(parseNearAmount(t.amount))
			delete t.amount
		})
	})

	return transactionsRef
}
