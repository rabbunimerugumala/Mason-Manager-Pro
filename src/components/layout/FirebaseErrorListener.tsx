'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.message, error.context);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let description = "You don't have permission to perform this action.";
      if (isDevelopment) {
          description = `Check browser console for details on the denied ${error.context.operation} operation at path: ${error.context.path}`;
      }

      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: description,
      });

      // In development, we can throw the error to make it visible in Next.js overlay
      if (isDevelopment) {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
