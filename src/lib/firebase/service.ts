import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Interface for query constraints
 */
export interface WhereConstraint {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: any;
}

/**
 * Generic Firebase service for CRUD operations
 */
class FirebaseService {
  /**
   * Get a single document by ID
   */
  async getDocument<T = DocumentData>(
    collectionName: string,
    documentId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...this.convertTimestamps(data),
        } as T;
      }

      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  async getCollection<T = DocumentData>(
    collectionName: string,
    constraints: (QueryConstraint | WhereConstraint)[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);

      // Convert WhereConstraint objects to QueryConstraint objects
      const queryConstraints: QueryConstraint[] = constraints.map(constraint => {
        if ('field' in constraint && 'operator' in constraint && 'value' in constraint) {
          // It's a WhereConstraint object, convert it
          return where(constraint.field, constraint.operator, constraint.value);
        }
        // It's already a QueryConstraint
        return constraint as QueryConstraint;
      });

      const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;
      const querySnapshot = await getDocs(q);

      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...this.convertTimestamps(data),
        } as T);
      });

      return documents;
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Add a new document to a collection
   */
  async addDocument<T = DocumentData>(
    collectionName: string,
    data: Omit<T, 'id'>
  ): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const processedData = this.convertDatesToTimestamps(data);
      const docRef = await addDoc(collectionRef, processedData);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument<T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const processedData = this.convertDatesToTimestamps(data);
      await updateDoc(docRef, processedData);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get documents with specific conditions
   */
  async queryDocuments<T = DocumentData>(
    collectionName: string,
    conditions: {
      field: string;
      operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains';
      value: any;
    }[],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints: QueryConstraint[] = [];

      // Add where conditions
      conditions.forEach((condition) => {
        constraints.push(where(condition.field, condition.operator, condition.value));
      });

      // Add order by
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      // Add limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...this.convertTimestamps(data),
        } as T);
      });

      return documents;
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a document exists
   */
  async documentExists(collectionName: string, documentId: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking document existence in ${collectionName}:`, error);
      return false;
    }
  }

  /**
   * Get documents count (approximation)
   */
  async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      return querySnapshot.size;
    } catch (error) {
      console.error(`Error getting collection count for ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Convert Firestore Timestamps to JavaScript Dates
   */
  private convertTimestamps(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const converted: any = Array.isArray(data) ? [] : {};

    for (const key in data) {
      const value = data[key];

      if (value && typeof value === 'object') {
        if (value.toDate && typeof value.toDate === 'function') {
          // This is a Firestore Timestamp
          converted[key] = value.toDate();
        } else if (Array.isArray(value)) {
          // Recursively convert arrays
          converted[key] = value.map((item) => this.convertTimestamps(item));
        } else {
          // Recursively convert objects
          converted[key] = this.convertTimestamps(value);
        }
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }

  /**
   * Convert JavaScript Dates to Firestore Timestamps
   */
  private convertDatesToTimestamps(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const converted: any = Array.isArray(data) ? [] : {};

    for (const key in data) {
      const value = data[key];

      if (value instanceof Date) {
        // Convert Date to Firestore Timestamp
        converted[key] = Timestamp.fromDate(value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively convert objects
        converted[key] = this.convertDatesToTimestamps(value);
      } else if (Array.isArray(value)) {
        // Recursively convert arrays
        converted[key] = value.map((item) => this.convertDatesToTimestamps(item));
      } else {
        converted[key] = value;
      }
    }

    return converted;
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

// Export the class for testing
export { FirebaseService };

// Export helpful query builders
export const buildQuery = {
  where: (field: string, operator: any, value: any) => where(field, operator, value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (count: number) => limit(count),
};