'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { FormSection, FormField, FieldType } from '@/types';
import { Loader2, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const BLUE = '#37b5ff';
const RED = '#f87171';
const GREEN = '#22c55e';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

export default function NewTemplatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Partial<FormSection>[]>([
    { id: 'section_1', title: '', description: '', order: 1, fields: [] },
  ]);

  const addSection = () => {
    setSections(prev => [...prev, { id: `section_${prev.length + 1}`, title: '', description: '', order: prev.length + 1, fields: [] }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) { toast.error('Template must have at least one section'); return; }
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, updates: Partial<FormSection>) => {
    setSections(prev => { const n = [...prev]; n[index] = { ...n[index], ...updates }; return n; });
  };

  const addFieldToSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const fieldCount = section.fields?.length || 0;
    const newField = {
      id: `${section.id}_field_${fieldCount + 1}`, label: '', type: 'text' as FieldType,
      description: '', includeComments: false,
      validation: { required: false },
      analytics: { enabled: false, type: 'none' as const },
      order: fieldCount + 1, _optionsRaw: '',
    };
    setSections(prev => {
      const n = [...prev];
      n[sectionIndex].fields = [...(n[sectionIndex].fields || []), newField as unknown as FormField];
      return n;
    });
  };

  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    setSections(prev => {
      const n = [...prev];
      n[sectionIndex].fields = n[sectionIndex].fields?.filter((_, i) => i !== fieldIndex);
      return n;
    });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    setSections(prev => {
      const n = [...prev];
      const fields = n[sectionIndex].fields || [];
      fields[fieldIndex] = { ...fields[fieldIndex], ...updates };
      n[sectionIndex].fields = fields;
      return n;
    });
  };

  const handleSave = async () => {
    if (!user) { toast.error('You must be logged in'); return; }
    if (!name.trim()) { toast.error('Template name is required'); return; }
    if (sections.length === 0) { toast.error('Template must have at least one section'); return; }
    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].title?.trim()) { toast.error(`Section ${i + 1} must have a title`); return; }
      if (!sections[i].fields?.length) { toast.error(`Section ${i + 1} must have at least one field`); return; }
      for (let j = 0; j < sections[i].fields!.length; j++) {
        if (!sections[i].fields![j].label?.trim()) { toast.error(`Field ${j + 1} in section ${i + 1} must have a label`); return; }
      }
    }
    setSaving(true);
    try {
      const cleanSections = sections.map(section => ({
        ...section,
        fields: section.fields?.map(field => { const { _optionsRaw, ...cleanField } = field as FormField & { _optionsRaw?: string }; return cleanField; }) || []
      }));
      const result = await formTemplateService.createTemplate({ name, description, isActive: false, isArchived: false, allowPartialSubmission: true, sections: cleanSections as FormSection[], createdBy: user.id });
      if (result.success && result.data) {
        toast.success('Template created successfully');
        router.push(`/admin/form-templates/${result.data.id}`);
      } else {
        toast.error(result.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error creating template');
    } finally {
      setSaving(false);
    }
  };

  const fieldLabel = (text: string, required?: boolean) => (
    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>
      {text} {required && <span style={{ color: RED }}>*</span>}
    </p>
  );

  const Toggle = ({ checked, onChange }: { checked?: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!checked)} style={{ width: '36px', height: '20px', borderRadius: '10px', background: checked ? BLUE : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '2px', left: checked ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );

  return (
    <>
      <style>{`
        .nt-inp { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 9px !important; padding: 9px 12px !important; width: 100% !important; font-size: 15px !important; outline: none !important; box-sizing: border-box !important; }
        .nt-inp:focus { border-color: rgba(55,181,255,0.45) !important; }
        .nt-inp::placeholder { color: rgba(255,255,255,0.25) !important; }
        .nt-sel { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: rgba(255,255,255,0.8) !important; border-radius: 9px !important; padding: 8px 12px !important; width: 100% !important; font-size: 15px !important; outline: none !important; cursor: pointer !important; }
        .nt-ta { background: rgba(2,18,44,0.7) !important; border: 1px solid rgba(55,181,255,0.18) !important; color: #fff !important; border-radius: 9px !important; padding: 9px 12px !important; width: 100% !important; font-size: 15px !important; outline: none !important; resize: vertical !important; box-sizing: border-box !important; }
        .nt-ta:focus, .nt-inp:focus, .nt-sel:focus { border-color: rgba(55,181,255,0.45) !important; }
        .nt-ta::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/admin/form-templates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back to Templates
          </Link>
          <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : <><Save size={15} /> Create Template</>}
          </button>
        </div>

        {/* Basic Info */}
        <div style={{ position: 'relative', ...card, padding: '24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>Template Information</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Basic information about the form template</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>{fieldLabel('Template Name', true)}<input className="nt-inp" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Soccer Player Performance Tracker" /></div>
            <div>{fieldLabel('Description')}<textarea className="nt-ta" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this form is used for..." rows={3} /></div>
          </div>
        </div>

        {/* Sections header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px' }}>Sections</h2>
          <button onClick={addSection} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', color: BLUE, padding: '8px 16px', borderRadius: '9px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
            <Plus size={14} /> Add Section
          </button>
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div key={section.id} style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}44, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '17px' }}>Section {sectionIndex + 1}</p>
              <button onClick={() => removeSection(sectionIndex)} disabled={sections.length === 1} style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.08)', color: sections.length === 1 ? 'rgba(255,255,255,0.2)' : RED, cursor: sections.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={13} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>{fieldLabel('Section Title', true)}<input className="nt-inp" value={section.title || ''} onChange={e => updateSection(sectionIndex, { title: e.target.value })} placeholder="e.g., Pre-Game, In-Game Performance" /></div>
              <div>{fieldLabel('Section Description')}<textarea className="nt-ta" value={section.description || ''} onChange={e => updateSection(sectionIndex, { description: e.target.value })} placeholder="Describe this section..." rows={2} /></div>

              {/* Fields */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '15px' }}>Fields</p>
                  <button onClick={() => addFieldToSection(sectionIndex)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: GREEN, padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                {(!section.fields || section.fields.length === 0) && (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No fields yet. Click "Add Field" to get started.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.fields?.map((field, fieldIndex) => (
                    <div key={field.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                            <div>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Field Label *</p>
                              <input className="nt-inp" value={field.label || ''} onChange={e => updateField(sectionIndex, fieldIndex, { label: e.target.value })} placeholder="e.g., Well Rested?" />
                            </div>
                            <div>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Field Type</p>
                              <select className="nt-sel" value={field.type} onChange={e => updateField(sectionIndex, fieldIndex, { type: e.target.value as FieldType })}>
                                <option value="yesno">Yes/No</option>
                                <option value="radio">Radio (Single Choice)</option>
                                <option value="checkbox">Checkbox (Multiple)</option>
                                <option value="numeric">Numeric</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="text">Text</option>
                                <option value="textarea">Text Area</option>
                              </select>
                            </div>
                          </div>
                          {(field.type === 'radio' || field.type === 'checkbox') && (
                            <div>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Options (comma-separated)</p>
                              <input className="nt-inp"
                                value={(field as FormField & { _optionsRaw?: string })._optionsRaw ?? field.options?.join(', ') ?? ''}
                                onChange={e => updateField(sectionIndex, fieldIndex, { _optionsRaw: e.target.value } as Partial<FormField>)}
                                onBlur={e => {
                                  const options = e.target.value.split(',').map(o => o.trim()).filter(o => o.length > 0);
                                  updateField(sectionIndex, fieldIndex, { options, _optionsRaw: e.target.value } as Partial<FormField>);
                                }}
                                placeholder="e.g., poor, improving, team work, excellent"
                              />
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                              { key: 'required', label: 'Required', get: () => field.validation?.required, set: (v: boolean) => updateField(sectionIndex, fieldIndex, { validation: { ...field.validation, required: v } }) },
                              { key: 'comments', label: 'Include Comments', get: () => field.includeComments, set: (v: boolean) => updateField(sectionIndex, fieldIndex, { includeComments: v }) },
                              { key: 'analytics', label: 'Enable Analytics', get: () => field.analytics.enabled, set: (v: boolean) => updateField(sectionIndex, fieldIndex, { analytics: { ...field.analytics, enabled: v, type: v ? 'percentage' : 'none' } }) },
                            ].map(({ key, label, get, set }) => (
                              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Toggle checked={get()} onChange={set} />
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => removeFieldFromSection(sectionIndex, fieldIndex)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.08)', color: RED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bottom save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating Template…</> : <><Save size={15} /> Create Template</>}
          </button>
        </div>
      </div>
    </>
  );
}
