import { useEffect, useState } from 'react';
import type { ModelConfig } from '../api/modelApi';

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { provider: string; modelId: string; label?: string; apiKey?: string }) => void;
  onDelete?: (id: number) => void;
  model?: ModelConfig | null;
  mode: 'add' | 'edit';
}

const GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash Preview' },
];

const ModelModal: React.FC<ModelModalProps> = ({ isOpen, onClose, onSave, onDelete, model, mode }) => {
  const [label, setLabel] = useState('');
  const [modelId, setModelId] = useState(GEMINI_MODELS[0].id);
  const [apiKey, setApiKey] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && model) {
      setLabel(model.label || '');
      setModelId(model.modelId);
      setApiKey(''); // do not prefill secret
    } else {
      setLabel('');
      setModelId(GEMINI_MODELS[0].id);
      setApiKey('');
    }
  }, [isOpen, mode, model]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { provider: string; modelId: string; label?: string; apiKey?: string } = {
      provider: 'GEMINI',
      modelId,
      label: label.trim() || undefined,
    };
    if (mode === 'add' || apiKey.trim()) {
      payload.apiKey = apiKey.trim();
    }
    onSave(payload);
    onClose();
  };

  const handleDelete = () => {
    if (mode === 'edit' && model) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (onDelete && model?.id) {
      onDelete(model.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-3xl mx-4 shadow-2xl border border-slate-800">
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
          <p className="text-yellow-400 text-sm">Only Gemini is supported in the current version.</p>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{mode === 'add' ? 'Add Model' : 'Edit Model'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none transition-colors">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name (optional)</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
              placeholder="e.g., My Production Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
            >
              {GEMINI_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">API Key {mode === 'edit' && <span className="text-slate-400">(leave blank to keep existing)</span>}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
              placeholder="Enter your Gemini API Key"
              required={mode === 'add'}
            />
          </div>

          {mode === 'edit' && onDelete && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-200 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Model
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30">{mode === 'add' ? 'Add Model' : 'Update Model'}</button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete the model "{model?.label || model?.modelId}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelModal;
