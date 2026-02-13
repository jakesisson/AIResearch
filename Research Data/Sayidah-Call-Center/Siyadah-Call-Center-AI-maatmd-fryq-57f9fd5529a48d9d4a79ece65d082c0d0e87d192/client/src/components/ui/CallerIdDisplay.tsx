import React from 'react';
import { Phone, Globe, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CallerIdDisplayProps {
  phoneNumber: string;
  status: 'active' | 'inactive';
  location: string;
}

export default function CallerIdDisplay({ phoneNumber, status, location }: CallerIdDisplayProps) {
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">رقم الاتصال الحالي</h3>
              <p className="text-lg font-mono text-blue-600 dark:text-blue-400 direction-ltr">
                {phoneNumber}
              </p>
              <div className="flex items-center space-x-2 space-x-reverse mt-1">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{location}</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500 mt-1">
              {status === 'active' ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-300">
            <Shield className="w-4 h-4 text-green-500" />
            <span>رقم Twilio مُعتمد ومفعل للمكالمات الدولية</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}