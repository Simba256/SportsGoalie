import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RadioSelectFieldProps {
  label: string;
  options: string[];
  value: string;
  comments: string;
  onChange: (value: string, comments: string) => void;
}

// Helper function to convert technical field names to display labels
const formatOptionLabel = (option: string): string => {
  // Remove common prefixes
  const cleaned = option
    .replace(/^focus/, '')
    .replace(/^decisionMaking/, '')
    .replace(/^bodyLanguage/, '')
    .replace(/^skating/, '')
    .replace(/^positional/, '')
    .replace(/^rebound/, '')
    .replace(/^freezing/, '');

  // Convert camelCase to Title Case
  const withSpaces = cleaned.replace(/([A-Z])/g, ' $1').trim();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const RadioSelectField = ({
  label,
  options,
  value,
  comments,
  onChange,
}: RadioSelectFieldProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <Label className="text-sm font-semibold text-gray-900 mb-3 block">{label}</Label>

      <div className="flex flex-wrap gap-3 mb-3">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-all ${
              value === option
                ? 'bg-blue-500 text-white font-medium'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value, comments)}
              className="sr-only"
            />
            <span>{formatOptionLabel(option)}</span>
          </label>
        ))}
      </div>

      <div>
        <Label htmlFor={`${label}-comments`} className="text-xs text-gray-600">
          Comments
        </Label>
        <Textarea
          id={`${label}-comments`}
          value={comments}
          onChange={(e) => onChange(value, e.target.value)}
          placeholder="Add any comments..."
          className="mt-1 text-sm"
          rows={2}
        />
      </div>
    </div>
  );
};

export interface RadioFieldData {
  value: string;
  comments: string;
}

export const createEmptyRadioField = (): RadioFieldData => ({
  value: '',
  comments: '',
});
