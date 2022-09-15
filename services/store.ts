import { IPoolProcessed } from 'components/MainPool'
import create from 'zustand'

interface StoreState {
	ftPool: IPoolProcessed | null
	setFTPool: (tokenPool: IPoolProcessed) => void
	accountId: string | null
	setAccountId: (accountId: string) => void
}

export const useStore = create<StoreState>((set) => ({
	ftPool: null,
	setFTPool: (ftPool: IPoolProcessed) => set({ ftPool }),
	accountId: null,
	setAccountId: (accountId: string) => set({ accountId }),
}))
