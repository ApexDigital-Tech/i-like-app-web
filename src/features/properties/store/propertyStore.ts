import { create } from 'zustand';
import { Property, PROPERTIES } from '../../../types';
import { propertyService } from '../services/propertyService';

interface PropertyState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: (organizationId: string) => () => void;
  addProperty: (property: Partial<Property>, ownerId: string, organizationId: string) => Promise<void>;
  updateProperty: (id: string, data: Partial<Property>, organizationId: string) => Promise<void>;
  deleteProperty: (id: string, organizationId: string) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  loading: true,
  error: null,

  initialize: (organizationId) => {
    console.log('Initializing PropertyStore for org:', organizationId);
    
    const unsubscribe = propertyService.subscribeToProperties(
      organizationId,
      (props) => {
        // Sort in memory to avoid missing index errors
        const sortedProps = [...props].sort((a, b) => {
          const dateA = (a.createdAt as any)?.seconds || 0;
          const dateB = (b.createdAt as any)?.seconds || 0;
          return dateB - dateA;
        });

        // Fallback to static properties if DB is empty
        const finalProperties = sortedProps.length > 0 
          ? sortedProps 
          : PROPERTIES.map(p => ({ ...p, images: p.images || [p.image] }));
          
        set({ properties: finalProperties, loading: false });
      },
      (error) => {
        console.error('PropertyStore Error:', error);
        set({ error: error.message, loading: false });
      }
    );

    return unsubscribe;
  },

  addProperty: async (property, ownerId, organizationId) => {
    try {
      await propertyService.addProperty(property, ownerId, organizationId);
    } catch (error: any) {
      console.error('Error adding property:', error);
      throw error;
    }
  },


  updateProperty: async (id, data, organizationId) => {
    try {
      await propertyService.updateProperty(id, data, organizationId);
    } catch (error: any) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  deleteProperty: async (id, organizationId) => {
    try {
      await propertyService.deleteProperty(id, organizationId);
    } catch (error: any) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },
}));

