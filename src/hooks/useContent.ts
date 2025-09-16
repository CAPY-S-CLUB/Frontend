import { useContext } from 'react';
import ContentContext from '@/contexts/ContentContext';
import { ContentContextType } from '@/types/content';

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error('useContent deve ser usado dentro de um ContentProvider');
  }
  
  return context;
}

export default useContent;