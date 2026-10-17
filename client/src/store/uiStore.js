import { create } from 'zustand'

const useUIStore = create((set) => ({
    showNewChat: false,
    showGroupModal: false,
    showProfile: false,
    showAdmin: false,
    isMobileChatOpen: false,

    toggleNewChat: () => set((state) => ({ showNewChat: !state.showNewChat })),
    toggleGroupModal: () => set((state) => ({ showGroupModal: !state.showGroupModal })),
    toggleProfile: () => set((state) => ({ showProfile: !state.showProfile })),
    toggleAdmin: () => set((state) => ({ showAdmin: !state.showAdmin })),
    setMobileChatOpen: (val) => set({ isMobileChatOpen: val })
}))

export default useUIStore