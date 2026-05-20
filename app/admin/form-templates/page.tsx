'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { initializeDefaultTemplates, checkDefaultTemplatesExist } from '@/lib/templates/init-templates';
import { FormTemplate } from '@/types';
import { Loader2, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const BLUE = '#37b5ff';
const RED = '#f87171';
const GREEN = '#22c55e';
const card = { background: 'rgba(2,18,44,0.85)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '16px' } as const;

export default function FormTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [templatesExist, setTemplatesExist] = useState({ hockeyGoalie: false });

  useEffect(() => { loadTemplates(); checkTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await formTemplateService.getTemplates({ isArchived: false, orderBy: 'updatedAt', orderDirection: 'desc' });
      if (result.success && result.data) setTemplates(result.data);
      else toast.error('Failed to load templates');
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const checkTemplates = async () => {
    const exists = await checkDefaultTemplatesExist();
    setTemplatesExist(exists);
  };

  const handleInitializeTemplates = async () => {
    if (!user) { toast.error('You must be logged in'); return; }
    setInitializing(true);
    try {
      const result = await initializeDefaultTemplates(user.id);
      if (result.success) {
        toast.success(result.message);
        await loadTemplates();
        await checkTemplates();
      } else {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) result.errors.forEach(e => toast.error(e));
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
      toast.error('Failed to initialize templates');
    } finally {
      setInitializing(false);
    }
  };

  const handleActivateTemplate = async (templateId: string) => {
    try {
      const result = await formTemplateService.activateTemplate(templateId);
      if (result.success) {
        toast.success('Template activated successfully');
        await loadTemplates();
      } else {
        toast.error(result.message || 'Failed to activate template');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      toast.error('Error activating template');
    }
  };

  return (
    <>
      <style>{`
        .ft-btn:hover { opacity: 0.85 !important; }
        .ft-card:hover { border-color: rgba(55,181,255,0.25) !important; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>Form Templates</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Manage dynamic form templates for charting sessions</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={loadTemplates} disabled={loading} className="ft-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link href="/admin/form-templates/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`, color: '#fff', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
              <Plus size={14} /> Create Template
            </Link>
          </div>
        </div>

        {/* Initialize alert */}
        {!templatesExist.hockeyGoalie && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '14px', padding: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={18} color={RED} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Initialize Default Templates</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>No default templates found. Click to create the default Hockey Goalie Performance Tracker template.</p>
              </div>
            </div>
            <button onClick={handleInitializeTemplates} disabled={initializing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`, border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: initializing ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: initializing ? 0.7 : 1 }}>
              {initializing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Initializing…</> : <><Plus size={14} /> Initialize Templates</>}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
            <Loader2 size={32} color={BLUE} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : templates.length === 0 ? (
          <div style={{ position: 'relative', ...card, padding: '64px', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)` }} />
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Plus size={28} color="rgba(55,181,255,0.4)" />
            </div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>No Templates Found</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '20px' }}>Initialize default templates to get started</p>
            <button onClick={handleInitializeTemplates} disabled={initializing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: initializing ? 'not-allowed' : 'pointer', opacity: initializing ? 0.7 : 1 }}>
              {initializing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Initializing…</> : <><Plus size={14} /> Initialize Default Templates</>}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {templates.map((template) => (
              <div key={template.id} className="ft-card" style={{ position: 'relative', ...card, padding: '20px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${template.isActive ? GREEN : BLUE}66, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '4px' }}>{template.name}</p>
                    {template.description && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{template.description}</p>}
                  </div>
                  {template.isActive && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.12)', color: GREEN, padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Version', value: `v${template.version}` },
                    { label: 'Sections', value: String(template.sections.length) },
                    { label: 'Usage', value: `${template.usageCount || 0} entries` },
                    { label: 'Status', value: template.isActive ? 'Active' : 'Inactive' },
                    { label: 'Total Fields', value: String(template.sections.reduce((sum, s) => sum + s.fields.length, 0)) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>{label}</p>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {!template.isActive && (
                    <button onClick={() => handleActivateTemplate(template.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid rgba(34,197,94,0.3)`, background: 'rgba(34,197,94,0.08)', color: GREEN, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Activate</button>
                  )}
                  <Link href={`/admin/form-templates/${template.id}`} style={{ flex: 1, display: 'block', textAlign: 'center', padding: '8px', borderRadius: '8px', border: '1px solid rgba(55,181,255,0.2)', background: 'rgba(55,181,255,0.07)', color: BLUE, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>View Details</Link>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>Created: {template.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}</p>
                  {template.updatedAt && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>Updated: {template.updatedAt?.toDate?.().toLocaleDateString() || 'Unknown'}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
