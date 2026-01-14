import { atom } from 'nanostores';

export const isLoginOpen = atom(false);
export const isFriendModalOpen = atom(false);
export const isNameChangeOpen = atom(false);

export const friendToDeleteId = atom<string | null>(null);

export const isNewDrawOpen = atom(false); // Główny modal losowania
export const isParticipantSelectorOpen = atom(false); // Modal wyboru znajomych do losowania

export const selectedDraw = atom(null);
