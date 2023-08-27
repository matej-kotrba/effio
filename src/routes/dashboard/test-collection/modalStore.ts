import { writable } from "svelte/store";

type ModalStore = {
  openModal: () => void;
  modalDeleteInfo: {
    id?: string;
    title?: string;
  }
}

export const modalStore = writable<ModalStore>({
  openModal: () => { return },
  modalDeleteInfo: {
    id: '',
    title: ''
  }
})