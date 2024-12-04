"use client";

import { openDB } from "idb";
import { useState, useEffect } from "react";

/**
 * A reusable function to initialize the IndexedDB database.
 * Ensures that the necessary object stores are created.
 */
async function initDB() {
  try {
    const db = await openDB("MyDatabase", 1, {
      upgrade(db) {
        console.log("Running upgrade logic...");
        if (!db.objectStoreNames.contains("keyval")) {
          console.log("Creating 'keyval' object store...");
          db.createObjectStore("keyval");
        }
        if (!db.objectStoreNames.contains("vectors")) {
          console.log("Creating 'vectors' object store...");
          db.createObjectStore("vectors", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
    console.log("Database initialized successfully.");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

/**
 * Custom hook for managing state synchronized with IndexedDB.
 */
function useIndexedDB<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    let isMounted = true;

    async function loadFromDB() {
      try {
        const db = await initDB();
        const val = await db.get("keyval", key);
        if (isMounted && val !== undefined) {
          setStoredValue(val);
        }
      } catch (error) {
        console.error(`Error reading IndexedDB key "${key}":`, error);
      }
    }

    loadFromDB();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    async function updateDB() {
      try {
        const db = await initDB();
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await db.put("keyval", valueToStore, key);
      } catch (error) {
        console.error(`Error setting IndexedDB key "${key}":`, error);
      }
    }

    updateDB();
  };

  return [storedValue, setValue] as const;
}

/**
 * Save a vector to the 'vectors' object store in IndexedDB.
 */
export async function saveVector(vector: number[], metadata?: unknown) {
  try {
    const db = await initDB();
    console.log("Object stores:", db.objectStoreNames); // Debugging
    await db.add("vectors", { vector, metadata });
    console.log("Vector saved successfully.");
  } catch (error) {
    console.error("Error saving vector to IndexedDB:", error);
  }
}

/**
 * Retrieve vectors from IndexedDB and filter by cosine similarity.
 */
export async function getSimilarVectors(
  queryVector: number[],
  threshold = 0.5
) {
  try {
    const db = await initDB();
    const vectors = await db.getAll("vectors");
    console.log("vectors:", vectors);
    return vectors
      .map((item) => ({
        ...item,
        similarity: cosineSimilarity(queryVector, item.vector),
      }))
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error("Error fetching similar vectors:", error);
    return [];
  }
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export default useIndexedDB;
