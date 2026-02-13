import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function SettingsTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      console.log('🧪 Test: Fetching settings...');
      const response = await fetch('/api/settings');
      console.log('🧪 Test: Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('🧪 Test: Data received:', data);
      return data;
    }
  });

  console.log('🧪 Component state:', { data, isLoading, error });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Settings Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Error:</strong> {error ? error.message : 'None'}
        </div>
        
        <div>
          <strong>Data:</strong>
          <pre className="bg-slate-800 p-4 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
      
      {!isLoading && data && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Settings Content</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Company Name:</strong> {data.companyName}
            </div>
            <div>
              <strong>Admin Email:</strong> {data.adminEmail}
            </div>
            <div>
              <strong>Language:</strong> {data.language}
            </div>
            <div>
              <strong>Currency:</strong> {data.currency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}