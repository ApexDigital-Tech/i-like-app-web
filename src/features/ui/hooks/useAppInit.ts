import { useAuthInit } from '../../auth/hooks/useAuthInit';
import { usePropertiesInit } from '../../properties/hooks/usePropertiesInit';
import { useCRMInit } from '../../crm/hooks/useCRMInit';

export const useAppInit = () => {
  useAuthInit();
  usePropertiesInit();
  useCRMInit();
};
