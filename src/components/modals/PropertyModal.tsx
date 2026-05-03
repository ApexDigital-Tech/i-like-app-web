import React from 'react';
import { Modal } from '../Modal';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUIStore } from '../../features/ui/store/uiStore';
import { usePropertyStore } from '../../features/properties/store/propertyStore';
import { useCRMStore } from '../../features/crm/store/crmStore';
import { TRANSLATIONS, Property } from '../../types';
import { serverTimestamp } from 'firebase/firestore';

interface PropertyModalProps {
  lang: 'en' | 'es' | 'pt';
  mode: 'add' | 'edit';
  propertyToEdit?: Property | null;
  onPropertyUpdated?: (property: Property) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ 
  lang, 
  mode, 
  propertyToEdit,
  onPropertyUpdated 
}) => {
  const { user: currentUser, profile } = useAuthStore();
  const closeModal = useUIStore((state) => state.closeModal);
  const { addProperty, updateProperty } = usePropertyStore();
  const { addNotification } = useCRMStore();
  const t = TRANSLATIONS[lang];

  const handleSubmit = async () => {
    if (!currentUser) return;

    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value || '';
    const getNum = (id: string) => Number(getVal(id)) || 0;

    const images = [
      getVal('p-img-1'),
      getVal('p-img-2'),
      getVal('p-img-3'),
      getVal('p-img-4'),
    ].filter(img => img);

    const propertyData: any = {
      name: getVal('p-name') || 'Unnamed Property',
      price: getNum('p-price'),
      location: getVal('p-loc') || 'Unknown',
      type: getVal('p-type') as any,
      subType: getVal('p-subtype') as any,
      beds: getNum('p-beds'),
      baths: getNum('p-baths'),
      sqft: getNum('p-sqft'),
      description: getVal('p-desc'),
      images: images,
      image: images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop',
      char1Label: getVal('p-c1-l'),
      char1Value: getVal('p-c1-v'),
      char2Label: getVal('p-c2-l'),
      char2Value: getVal('p-c2-v'),
      char3Label: getVal('p-c3-l'),
      char3Value: getVal('p-c3-v'),
      char4Label: getVal('p-c4-l'),
      char4Value: getVal('p-c4-v'),
      amenities: getVal('p-amenities')?.split(',').map(s => s.trim()).filter(s => s) || [],
    };

    try {
      const organizationId = profile?.organizationId || 'default-org';
      
      if (mode === 'add') {
        const newProperty = {
          ...propertyData,
          ownerId: currentUser.uid,
          verifiedStatus: 'pending',
          createdAt: serverTimestamp(),
          tags: ['NEW'],
          valuationTrend: 0,
          yearBuilt: 2024,
          interestVelocity: 0.1,
          viewingRequests: 0,
          zip: '00000'
        };
        await addProperty(newProperty, currentUser.uid, organizationId);
        
        await addNotification({
          userId: 'admin',
          title: 'Nuevo Inmueble',
          message: `${newProperty.name} se ha añadido al inventario global.`,
          type: 'success',
        }, organizationId);
      } else if (mode === 'edit' && propertyToEdit) {
        await updateProperty(propertyToEdit.id, propertyData, organizationId);
        if (onPropertyUpdated) {
          onPropertyUpdated({ ...propertyToEdit, ...propertyData });
        }
      }
      closeModal();
    } catch (error: any) {
      console.error('Error saving property:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Error de permisos: No tienes autorización para guardar en esta organización.'
        : `Error al guardar: ${error.message}`;
      alert(errorMessage);
    }
  };

  return (
    <Modal title={mode === 'add' ? t.add_property : 'Editar Inmueble'}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.name}</label>
            <input id="p-name" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.name} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.price}</label>
            <input id="p-price" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.price} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.location}</label>
            <input id="p-loc" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.location} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.type}</label>
            <select id="p-type" className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.type}>
              <option value="Residential">{t.residential}</option>
              <option value="Commercial">{t.commercial}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.type} (Detalle)</label>
          <select id="p-subtype" className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.subType}>
            <option value="House">{t.houses}</option>
            <option value="Apartment">{t.apartments}</option>
            <option value="Land">{t.land}</option>
            <option value="Office">{t.offices}</option>
            <option value="Other">{t.other}</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.beds}</label>
            <input id="p-beds" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.beds || 2} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.baths}</label>
            <input id="p-baths" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.baths || 2} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.sqft}</label>
            <input id="p-sqft" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" defaultValue={propertyToEdit?.sqft} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">Galería de Imágenes (URLs)</label>
          <div className="grid grid-cols-2 gap-2">
            <input id="p-img-1" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" placeholder="Principal" defaultValue={propertyToEdit?.images?.[0] || (propertyToEdit as any)?.image} />
            <input id="p-img-2" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" defaultValue={propertyToEdit?.images?.[1]} />
            <input id="p-img-3" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" defaultValue={propertyToEdit?.images?.[2]} />
            <input id="p-img-4" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" defaultValue={propertyToEdit?.images?.[3]} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">Características Personalizadas</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <input id="p-c1-l" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" placeholder="Etiqueta 1" defaultValue={propertyToEdit?.char1Label || 'Año de Construcción'} />
              <input id="p-c1-v" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" placeholder="Valor 1" defaultValue={propertyToEdit?.char1Value || '2024'} />
            </div>
            <div className="space-y-1">
              <input id="p-c2-l" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" placeholder="Etiqueta 2" defaultValue={propertyToEdit?.char2Label || 'Certificación'} />
              <input id="p-c2-v" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" placeholder="Valor 2" defaultValue={propertyToEdit?.char2Value || 'LEED Gold'} />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.amenities}</label>
          <input id="p-amenities" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Pool, Gym..." defaultValue={propertyToEdit?.amenities?.join(', ')} />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-display font-bold text-zinc-500 tracking-widest uppercase">{t.description}</label>
          <textarea id="p-desc" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs h-20 text-white" defaultValue={propertyToEdit?.description} />
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-primary text-black py-3 rounded-xl font-display font-black uppercase tracking-widest text-[10px] mt-4 shadow-[0_0_20px_rgba(255,200,1,0.2)] hover:scale-[1.02] transition-all"
        >
          {mode === 'add' ? t.save : 'Actualizar Inmueble'}
        </button>
      </div>
    </Modal>
  );
};
