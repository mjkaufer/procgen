import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AnimationFrameState {
  fns: (() => void)[];
  addFns: (fns: ((() => void))[]) => void;
  removeFns: (fns: ((() => void))[]) => void;
}

export const useAnimationFrameStore = create<AnimationFrameState>()(
  // devtools(
  //   persist(
  //     (set) => ({
  //       fns: [],
  //       addFns: (fns: ((() => void))[]) => set((state) => ({ fns: [...state.fns, ...fns] })),
  //       removeFns: (fns: ((() => void))[]) => set((state) => ({ fns: state.fns.filter(fn => !fns.includes(fn)) })),
  //     }),
  //     {
  //       name: 'animation-frame-store',
  //     }
  //   )
  // )
  (set) => ({
    fns: [],
    addFns: (fns: ((() => void))[]) => set((state) => ({ fns: [...state.fns, ...fns] })),
    removeFns: (fns: ((() => void))[]) => set((state) => ({ fns: state.fns.filter(fn => !fns.includes(fn)) })),
  }),
)