'use client';

import { YesNoResponse } from '@/types';

interface YesNoFieldProps {
  label: string;
  value: boolean;
  comments: string;
  onChange: (key: 'value' | 'comments', val: boolean | string) => void;
}

export const YesNoField = ({ label, value, comments, onChange }: YesNoFieldProps) => (
  <div className="space-y-2 p-4 border border-gray-200 rounded-lg bg-white">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange('value', e.target.checked)}
        className="w-5 h-5 rounded border-gray-300"
      />
      <label className="font-medium text-gray-900">{label}</label>
    </div>
    <textarea
      placeholder="Add comments..."
      value={comments}
      onChange={(e) => onChange('comments', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      rows={2}
    />
  </div>
);

export const createEmptyYesNo = (): YesNoResponse => ({ value: false, comments: '' });
