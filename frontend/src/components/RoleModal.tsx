import { useState, useEffect } from "react";

interface Role {
  id?: number;
  name: string;
  description: string;
  userId?: number;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  onDelete?: (roleId: number) => void;
  role?: Role | null;
  mode: 'add' | 'edit';
}

const RoleModal = ({ isOpen, onClose, onSave, onDelete, role, mode }: RoleModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (role && mode === 'edit') {
      setName(role.name);
      setDescription(role.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [role, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      return;
    }

    const roleData: Role = {
      ...(role && mode === 'edit' && { id: role.id }),
      name: name.trim(),
      description: description.trim(),
    };

    onSave(roleData);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  const handleDelete = () => {
    if (mode === "edit" && role) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (onDelete && role?.id) {
      onDelete(role.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-3xl mx-4 shadow-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'add' ? 'Add New Role' : 'Edit Role'}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
              placeholder="Enter role name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800 resize-none"
              placeholder="Enter role description"
              rows={10}
              required
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
                Delete Role
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30"
            >
              {mode === 'add' ? 'Add Role' : 'Update Role'}
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete the role "{role?.name}"? This action cannot be undone.
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

export default RoleModal;