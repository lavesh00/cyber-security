import React from 'react';
import { Lock } from 'lucide-react';

export default function Header({ title, subtitle, actions }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">RSA Encrypted</span>
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
