'use client';

import { FormTemplate, DynamicChartingEntry, FormField } from '@/types';
import { Card } from '@/components/ui/card';
import { BarChart3, CheckCircle, XCircle, Hash, Type, Calendar } from 'lucide-react';

interface DynamicSessionAnalyticsProps {
  template: FormTemplate;
  entry: DynamicChartingEntry;
}

export function DynamicSessionAnalytics({ template, entry }: DynamicSessionAnalyticsProps) {
  if (!entry || !entry.responses) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No charting data available yet</p>
        <p className="text-sm text-gray-500 mt-2">Fill out the charting sections to see analytics here</p>
      </div>
    );
  }

  // Collect all fields with their responses
  const fieldStats: Array<{
    field: FormField;
    sectionTitle: string;
    value: any;
    sectionId: string;
  }> = [];

  template.sections.forEach((section) => {
    const sectionData = entry.responses[section.id];
    if (!sectionData) return;

    section.fields.forEach((field) => {
      let value: any = null;

      if (section.isRepeatable && Array.isArray(sectionData)) {
        // For repeatable sections, aggregate values
        value = sectionData.map((instance: any) => instance[field.id]).filter(v => v !== undefined);
      } else {
        // Regular section
        value = (sectionData as any)[field.id];
      }

      if (value !== null && value !== undefined) {
        fieldStats.push({
          field,
          sectionTitle: section.title,
          value,
          sectionId: section.id,
        });
      }
    });
  });

  // Generate analytics cards based on field types
  const renderAnalyticsCard = (stat: typeof fieldStats[0], index: number) => {
    const { field, sectionTitle, value } = stat;

    // Number fields: show the value with appropriate formatting
    if (field.type === 'number') {
      const numValue = typeof value === 'number' ? value : parseFloat(value?.value || value || '0');
      return (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{sectionTitle}</p>
              <p className="text-sm font-medium text-gray-700 mb-2">{field.label}</p>
              <p className="text-2xl font-bold text-blue-600">{numValue}</p>
            </div>
            <Hash className="w-5 h-5 text-blue-500 mt-1" />
          </div>
        </Card>
      );
    }

    // Checkbox fields: show yes/no status
    if (field.type === 'checkbox') {
      const isChecked = value === true || value?.value === true;
      return (
        <Card key={index} className={`p-4 ${isChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{sectionTitle}</p>
              <p className="text-sm font-medium text-gray-700">{field.label}</p>
            </div>
            {isChecked ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </Card>
      );
    }

    // Select/Radio fields: show the selected value
    if (field.type === 'select' || field.type === 'radio') {
      const selectedValue = value?.value || value;
      return (
        <Card key={index} className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{sectionTitle}</p>
              <p className="text-sm font-medium text-gray-700 mb-2">{field.label}</p>
              <p className="text-base font-semibold text-purple-700 capitalize">{selectedValue}</p>
            </div>
            <Type className="w-5 h-5 text-purple-500 mt-1" />
          </div>
        </Card>
      );
    }

    // Date fields: show formatted date
    if (field.type === 'date') {
      const dateValue = value?.value || value;
      const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A';
      return (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{sectionTitle}</p>
              <p className="text-sm font-medium text-gray-700 mb-2">{field.label}</p>
              <p className="text-base font-semibold text-gray-900">{formattedDate}</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-500 mt-1" />
          </div>
        </Card>
      );
    }

    // Text/Textarea fields: show character count or preview
    if (field.type === 'text' || field.type === 'textarea') {
      const textValue = value?.value || value || '';
      const charCount = textValue.length;
      const preview = textValue.length > 50 ? textValue.substring(0, 50) + '...' : textValue;

      return (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{sectionTitle}</p>
              <p className="text-sm font-medium text-gray-700 mb-2">{field.label}</p>
              {preview && (
                <p className="text-xs text-gray-600 mb-2 italic">{preview}</p>
              )}
              <p className="text-xs text-gray-500">{charCount} characters</p>
            </div>
            <Type className="w-5 h-5 text-gray-500 mt-1" />
          </div>
        </Card>
      );
    }

    return null;
  };

  // Filter out fields that should be shown as analytics (numbers, checkboxes, selects mainly)
  const analyticsFields = fieldStats.filter(stat =>
    ['number', 'checkbox', 'select', 'radio'].includes(stat.field.type)
  );

  if (analyticsFields.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No analytics available</p>
        <p className="text-sm text-gray-500 mt-2">This form doesn't contain trackable metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm font-medium text-gray-700">Form Completion</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{entry.completionPercentage}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">
            {entry.isComplete ? (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4" />
                Complete
              </span>
            ) : (
              <span className="text-yellow-600 font-semibold">In Progress</span>
            )}
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsFields.map((stat, index) => renderAnalyticsCard(stat, index))}
      </div>

      {/* Text fields section (if any) */}
      {fieldStats.filter(stat => ['text', 'textarea'].includes(stat.field.type)).length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Notes & Comments</h4>
          <div className="space-y-3">
            {fieldStats
              .filter(stat => ['text', 'textarea'].includes(stat.field.type))
              .map((stat, index) => {
                const textValue = stat.value?.value || stat.value || '';
                if (!textValue) return null;

                return (
                  <Card key={index} className="p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">{stat.sectionTitle}</p>
                    <p className="text-sm font-semibold text-gray-900 mb-2">{stat.field.label}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{textValue}</p>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
