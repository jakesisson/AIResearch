import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface PlaceholderMessageProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
  className?: string;
}

export default function PlaceholderMessage({ 
  title = "قريباً", 
  description = "هذه الميزة قيد التطوير وستكون متاحة قريباً",
  showIcon = true,
  className = ""
}: PlaceholderMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {showIcon && (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
          <div className="relative">
            <Clock className="w-8 h-8 text-blue-400" aria-hidden="true" />
            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" aria-hidden="true" />
          </div>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-300 max-w-md leading-relaxed">
        {description}
      </p>
      
      <div className="mt-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <span className="text-sm text-blue-300">سيتم الإضافة في التحديث القادم</span>
      </div>
    </div>
  );
}