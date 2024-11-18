// hooks/useIndexedDB.ts

"use client";
import { openDB } from "idb";
import { useState, useEffect } from "react";

/**
 * A custom hook that synchronizes state with IndexedDB.
 * @param key The key under which the data is stored in IndexedDB.
 * @param initialValue The initial value to use if no data exists in IndexedDB.
 * @returns A tuple containing the stored value and a setter function.
 */
function useIndexedDB<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    let isMounted = true;

    async function initDB() {
      if (typeof window === "undefined") return;
      try {
        const db = await openDB("MyDatabase", 1, {
          upgrade(db) {
            db.createObjectStore("keyval");
          },
        });
        const val = await db.get("keyval", key);
        if (isMounted && val !== undefined) {
          setStoredValue(val);
        }
      } catch (error) {
        console.error(`Error reading IndexedDB key "${key}":`, error);
      }
    }

    initDB();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    async function updateDB() {
      if (typeof window === "undefined") return;
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        const db = await openDB("MyDatabase", 1, {
          upgrade(db) {
            db.createObjectStore("keyval");
          },
        });
        await db.put("keyval", valueToStore, key);
      } catch (error) {
        console.error(`Error setting IndexedDB key "${key}":`, error);
      }
    }
    updateDB();
  };

  return [storedValue, setValue] as const;
}

export default useIndexedDB;
