import { create, StateCreator } from 'zustand';

export function createStore<T extends object>(initializer: StateCreator<T>) {
  return create<T>()(initializer);
}
