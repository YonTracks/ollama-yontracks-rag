// hooks/useLocalStorage.ts

"use client";
import { useState } from "react";

/**
 * A custom hook that synchronizes state with localStorage.
 * @param key The key under which the data is stored in localStorage.
 * @param initialValue The initial value to use if no data exists in localStorage.
 * @returns A tuple containing the stored value and a setter function.
 */
function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with the value from localStorage or the initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Handle cases where the stored value might not be valid JSON
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Updates both the state and localStorage.
   * @param value The new value to store, or a function that receives the current value and returns the new value.
   */
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Update state
      setStoredValue(valueToStore);
      // Update localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
