'use client';

import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Download, Upload, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AppData } from '@/types';

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataPage() {
  const { data, importData } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeHabits = data.habits.filter(h => !h.archived);
  const archivedHabits = data.habits.filter(h => h.archived);

  function handleExportJSON() {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `streak-backup-${today}.json`, 'application/json');
  }

  function handleExportJournal() {
    if (data.notes.length === 0) return;

    const MOOD_LABELS: Record<number, string> = { 1: 'Rough 😞', 2: 'Meh 😕', 3: 'Okay 😐', 4: 'Good 😊', 5: 'Amazing 🤩' };
    const sorted = [...data.notes].sort((a, b) => b.date.localeCompare(a.date));

    const text = [
      '# Streak Journal Export',
      `Exported: ${format(new Date(), 'MMMM d, yyyy')}`,
      `${sorted.length} entries`,
      '',
      '---',
      '',
      ...sorted.flatMap(n => [
        `## ${format(new Date(n.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}`,
        `Mood: ${MOOD_LABELS[n.mood] ?? n.mood}`,
        '',
        n.content ? n.content : '_No reflection written._',
        '',
        '---',
        '',
      ]),
    ].join('\n');

    downloadFile(text, `streak-journal-${today}.md`, 'text/markdown');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<AppData>;
        if (!parsed.habits && !parsed.notes) {
          throw new Error('File does not look like a Streak backup.');
        }
        importData(parsed);
        setImportStatus('success');
        setImportMsg(`Restored ${parsed.habits?.length ?? 0} habits and ${parsed.notes?.length ?? 0} journal entries.`);
      } catch (err: unknown) {
        setImportStatus('error');
        setImportMsg(err instanceof Error ? err.message : 'Invalid file.');
      }
      setTimeout(() => setImportStatus('idle'), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const totalCompletions = data.habits.reduce(
    (sum, h) => sum + Object.values(h.completions).filter(Boolean).length,
    0
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Database size={20} className="text-violet-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Your Data</h1>
        </div>
        <p className="text-gray-400 text-sm">Export, back up, or restore your Streak data</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Habits', value: activeHabits.length },
          { label: 'Archived', value: archivedHabits.length },
          { label: 'Journal Entries', value: data.notes.length },
          { label: 'Total Check-ins', value: totalCompletions },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-4 text-center"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
          >
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Export */}
      <div
        className="bg-white rounded-2xl p-5 mb-4"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
      >
        <h2 className="font-bold text-slate-900 mb-1">Export</h2>
        <p className="text-[13px] text-slate-400 mb-4">Download a copy of your data to keep or transfer to another device.</p>

        <div className="space-y-3">
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-white font-semibold text-[14px] transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
          >
            <Download size={18} />
            <div className="text-left">
              <p>Export all data</p>
              <p className="text-[11px] font-normal opacity-75">Habits, journal, achievements — full backup as JSON</p>
            </div>
          </button>

          <button
            onClick={handleExportJournal}
            disabled={data.notes.length === 0}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-[14px] transition-all disabled:opacity-40"
            style={{
              background: '#F5F3FF',
              color: '#7C3AED',
              border: '1.5px solid #DDD6FE',
            }}
          >
            <FileText size={18} />
            <div className="text-left">
              <p>Export journal</p>
              <p className="text-[11px] font-normal opacity-60">
                {data.notes.length > 0 ? `${data.notes.length} entries as readable Markdown` : 'No journal entries yet'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Import */}
      <div
        className="bg-white rounded-2xl p-5"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
      >
        <h2 className="font-bold text-slate-900 mb-1">Restore from backup</h2>
        <p className="text-[13px] text-slate-400 mb-4">
          Import a previously exported JSON file to restore your data. This will merge with your current data.
        </p>

        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-[14px] transition-all"
          style={{ background: '#F8FAFC', color: '#475569', border: '1.5px dashed #CBD5E1' }}
        >
          <Upload size={18} />
          <div className="text-left">
            <p>Choose backup file</p>
            <p className="text-[11px] font-normal opacity-60">Select a streak-backup-*.json file</p>
          </div>
        </button>

        {importStatus !== 'idle' && (
          <div
            className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold"
            style={{
              background: importStatus === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: importStatus === 'success' ? '#16A34A' : '#DC2626',
              border: `1px solid ${importStatus === 'success' ? '#BBF7D0' : '#FECACA'}`,
            }}
          >
            {importStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {importMsg}
          </div>
        )}
      </div>
    </div>
  );
}
