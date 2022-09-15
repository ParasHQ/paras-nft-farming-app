import { IPoolProcessed } from 'components/MainPool'
import create from 'zustand'

interface StoreState {
	ftPool: IPoolProcessed | null
	setFTPool: (tokenPool: IPoolProcessed) => void
}

export const useStore = create<StoreState>((set) => ({
	ftPool: null,
	setFTPool: (ftPool: IPoolProcessed) => set({ ftPool }),
}))
