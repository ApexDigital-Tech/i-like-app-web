import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Property } from '../../../types';

export const propertyService = {
  /**
   * Suscribirse a la lista de propiedades de una organización específica
   */
  subscribeToProperties: (organizationId: string, callback: (properties: Property[]) => void, onError: (error: any) => void): Unsubscribe => {
    // Filtro de aislamiento obligatorio
    const q = query(
      collection(db, 'properties'), 
      where('organizationId', '==', organizationId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const props = snapshot.docs.map(doc => {
        const data = doc.data();
        const images = data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []);
        return { 
          id: doc.id, 
          ...data,
          images
        } as Property;
      });
      callback(props);
    }, onError);
  },

  /**
   * Suscribirse a TODAS las propiedades del sistema (Solo SuperAdmin)
   */
  subscribeToAllProperties: (callback: (properties: Property[]) => void, onError: (error: any) => void): Unsubscribe => {
    const q = collection(db, 'properties');
    
    return onSnapshot(q, (snapshot) => {
      const props = snapshot.docs.map(doc => {
        const data = doc.data();
        const images = data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []);
        return { 
          id: doc.id, 
          ...data,
          images
        } as Property;
      });
      callback(props);
    }, onError);
  },

  /**
   * Agregar una nueva propiedad asociada a una organización
   */
  addProperty: async (property: Partial<Property>, ownerId: string, organizationId: string): Promise<string> => {
    const docRef = await addDoc(collection(db, 'properties'), {
      ...property,
      ownerId,
      organizationId, // Inyección de contexto SaaS
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },


  /**
   * Actualizar una propiedad existente
   */
  updateProperty: async (id: string, data: Partial<Property>, organizationId: string): Promise<void> => {
    const propertyRef = doc(db, 'properties', id);
    // Nota: El organizationId se pasa para asegurar que la acción sea intencional sobre esa org,
    // las reglas de seguridad validarán que el recurso pertenezca a esa organización.
    await updateDoc(propertyRef, {
      ...data,
      organizationId, // Aseguramos consistencia
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Eliminar una propiedad
   */
  deleteProperty: async (id: string, organizationId: string): Promise<void> => {
    // La validación de organización ocurre a nivel de reglas de seguridad
    await deleteDoc(doc(db, 'properties', id));
  }
};
