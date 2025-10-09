import { useState, useEffect } from 'react';
import { getAllRoles } from '../api/roleApi';
import type { Role } from '../api/roleApi';
import toast from 'react-hot-toast';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  refreshTrigger?: number;
  roles?: Role[];
  onEditRole?: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect, refreshTrigger, roles: propRoles, onEditRole }) => {
  const [roles, setRoles] = useState<Role[]>(propRoles ?? []);
  const [isLoading, setIsLoading] = useState(!propRoles);

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
        <div className="text-center text-gray-400 py-4">
          Loading roles...
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-white">Select Role</h3>
      <div className="space-y-2">
        {roles.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No roles available. Create your first role!
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className={`w-full p-3 rounded-lg border transition-colors ${
              selectedRole === role.name
                ? 'bg-blue-900 border-blue-500 text-blue-100'
                : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => onRoleSelect(role.name)}
                  className="text-left flex-1"
                >
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-gray-300">{role.description}</div>
                </button>
                {onEditRole && (
                  <button
                    onClick={() => onEditRole(role)}
                    className="text-sm px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600"
                    title="Edit role"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoleSelector;