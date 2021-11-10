import JSBI from 'jsbi'

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
		var n = precise(Number.parseFloat(sn))
		var e = Math.max(Math.min(3 * Math.floor(getExponent(n) / 3), 24), -24)
		return precise(n / Math.pow(10, e)).toString() + PREFIXES[e]
	}

	return toHumanString(val)
}

export const prettyBalance = (balance: any, decimals: number = 18, len: number = 8) => {
	if (!balance) {
		return '0'
	}
	const diff = balance.toString().length - decimals
	const fixedPoint = Math.max(len, len - Math.max(diff, 0))
	const fixedBalance = (balance / 10 ** decimals).toFixed(fixedPoint)
	const finalBalance = parseFloat(fixedBalance).toString()
	const [head, tail] = finalBalance.split('.')
	if (head === '0') {
		if (tail) {
			return `${head}.${tail.substring(0, len - 1)}`
		}
		return `${head}`
	}
	const formattedHead = head.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return tail ? `${formattedHead}.${tail}` : formattedHead
}

export const formatParasAmount = (balance: string | number, fracDigits?: number) => {
	return JSBI.divide(JSBI.BigInt(balance), JSBI.BigInt(10 ** 18)).toString()
}

export const parseParasAmount = (balance: string | number) => {
	return JSBI.multiply(JSBI.BigInt(balance), JSBI.BigInt(10 ** 18)).toString()
}
