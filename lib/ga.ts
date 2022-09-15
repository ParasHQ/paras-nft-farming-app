import { useNearProvider } from 'hooks/useNearProvider'
import { event } from './gtag'

const { accountId } = useNearProvider()

export const trackLoggedInPage = (accountId: string) => {
	event({
		action: 'view_staking_page_login',
		category: 'view_main_page',
		label: 'view',
		value: accountId,
	})
}

export const trackStakingLogin = () => {
	event({
		action: 'staking_click_login',
		category: 'login_main_page',
		label: `click`,
	})
}

export const trackStakingGetParas = () => {
	event({
		action: 'staking_click_getparas',
		category: 'getparas_main_page',
		label: `click`,
		...(accountId && {
			additionalParams: {
				accountId,
			},
		}),
	})
}

export const trackStakingStakeParas = (value: string) => {
	event({
		action: 'staking_click_stakeparas',
		category: 'stake_main_page',
		label: `click`,
		value,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingStakeParasImpression = () => {
	event({
		action: 'staking_click_stakeparas_impression',
		category: 'stake_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingUnstakeParas = (value: string) => {
	event({
		action: 'staking_click_unstakeparas',
		category: 'stake_main_page',
		label: `click`,
		value,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingUnstakeParasImpression = () => {
	event({
		action: 'staking_click_unstakeparas_impression',
		category: 'stake_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingLockedParas = (value: string) => {
	event({
		action: 'staking_click_lockedstaking',
		category: 'locked_main_page',
		label: `click`,
		value,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingLockedParasImpression = () => {
	event({
		action: 'staking_click_lockedparas_impression',
		category: 'locked_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingUnlockedParas = (value: string) => {
	event({
		action: 'staking_click_unlockparas',
		category: 'locked_main_page',
		label: `click`,
		value,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingUnlockedParasImpression = () => {
	event({
		action: 'staking_click_unlockedparas_impression',
		category: 'locked_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingTopupParas = (value: string) => {
	event({
		action: 'staking_click_topup',
		category: 'locked_main_page',
		label: `click`,
		value,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingTopupParasImpression = () => {
	event({
		action: 'staking_click_topup_impression',
		category: 'locked_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}

export const trackStakingRewardsParas = (type: 'claim-and-withdraw' | 'claim-and-deposit') => {
	event({
		action: 'staking_click_rewards',
		category: 'stake_main_page',
		label: `click`,
		additionalParams: {
			accountId,
			type,
		},
	})
}

export const trackStakingRewardsParasImpression = () => {
	event({
		action: 'staking_click_rewards',
		category: 'stake_main_page',
		label: `click`,
		additionalParams: {
			accountId,
		},
	})
}
