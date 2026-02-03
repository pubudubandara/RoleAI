import { useState, useEffect } from 'react';
import { getAllRoles } from '../api/roleApi';
import type { Role } from '../api/roleApi';
import toast from 'react-hot-toast';

interface RoleSelectorProps {
  selectedRoles: number[];
  onRolesChange: (roleIds: number[]) => void;
  refreshTrigger?: number;
  roles?: Role[];
  onEditRole?: (role: Role) => void;
  maxSelect?: number;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRoles, onRolesChange, refreshTrigger, roles: propRoles, onEditRole, maxSelect = 3 }) => {
  const [roles, setRoles] = useState<Role[]>(propRoles ?? []);
  const [isLoading, setIsLoading] = useState(!propRoles);

  const toggleRole = (id: number) => {
    const isSelected = selectedRoles.includes(id);
    if (isSelected) {
      onRolesChange(selectedRoles.filter(rid => rid !== id));
    } else {
      if (selectedRoles.length >= maxSelect) return; // enforce limit
      onRolesChange([...selectedRoles, id]);
    }
  };

  const loadRoles = async () => {
    try {
      if (propRoles) {
        // Roles provided by parent; no fetch needed
        setRoles(propRoles);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const fetchedRoles = await getAllRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast.error('Failed to load roles');
      // Do not inject hardcoded sample roles; show empty state instead
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [refreshTrigger, propRoles]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Select Role</h3>
        <div className="text-center text-slate-400 py-4">
          Loading roles...
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-white">Select Roles</h3>
      <div className="space-y-2">
        {roles.length === 0 ? (
          <div className="text-center text-slate-400 py-4">
            No roles available. Create your first role!
          </div>
        ) : (
          roles.map((role) => {
            const isSelected = selectedRoles.includes(role.id!);
            const disabled = !isSelected && selectedRoles.length >= maxSelect;
            return (
              <div key={role.id} className={`w-full p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/50 text-white ring-1 ring-blue-500/30'
                  : `bg-slate-800/50 border-slate-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:border-slate-600'}`
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => !disabled && toggleRole(role.id!)}
                    className="text-left flex-1 flex items-start gap-2"
                    disabled={disabled}
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-slate-300">{role.description}</div>
                    </div>
                  </button>
                {onEditRole && (
                  <button
                    onClick={() => onEditRole(role)}
                    className="text-sm px-2 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 transition-colors"
                    title="Edit role"
                  >
                    Edit
                  </button>
                )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoleSelector;