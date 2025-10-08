interface Role {
  id?: string;
  name: string;
  description: string;
}

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  onEditRole: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, selectedRole, onRoleSelect, onEditRole }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-white">Select Role</h3>
      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="flex gap-2">
            <button
              onClick={() => onRoleSelect(role.id!)}
              className={`flex-1 text-left p-3 rounded-lg border transition-colors ${
                selectedRole === role.id
                  ? 'bg-blue-900 border-blue-500 text-blue-100'
                  : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{role.name}</div>
              <div className="text-sm text-gray-400">{role.description}</div>
            </button>
            <button
              onClick={() => onEditRole(role)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              title="Edit role"
            >
              ✏️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;