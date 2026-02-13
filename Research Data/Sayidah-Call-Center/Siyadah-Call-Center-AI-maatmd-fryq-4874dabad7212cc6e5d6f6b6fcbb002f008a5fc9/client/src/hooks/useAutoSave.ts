import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ 
  data, 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions) => {
  const debouncedSave = useRef(
    debounce(async (dataToSave: any) => {
      const saveData = async () => {
        try {
          await onSave(dataToSave);
          console.log('✅ تم الحفظ التلقائي');
        } catch (error) {
          console.warn('Auto-save failed, will retry:', error);
          // Retry after a delay
          setTimeout(() => {
            saveData();
          }, 3000);
        }
      };
      saveData();
    }, delay)
  );

  useEffect(() => {
    if (enabled && data) {
      debouncedSave.current(data);
    }
  }, [data, enabled]);

  useEffect(() => {
    return () => {
      debouncedSave.current.cancel();
    };
  }, []);
};