interface Role {
  id: string;
  name: string;
  description: string;
}

const roles: Role[] = [
  { id: 'assistant', name: 'Assistant', description: 'Helpful AI assistant' },
  { id: 'teacher', name: 'Teacher', description: 'Educational instructor' },
  { id: 'friend', name: 'Friend', description: 'Casual conversation partner' },
  { id: 'expert', name: 'Expert', description: 'Specialized knowledge provider' },
];

interface RoleSelectorProps {
  selectedRole: string;
  onRoleSelect: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-white">Select Role</h3>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedRole === role.id
                ? 'bg-blue-900 border-blue-500 text-blue-100'
                : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            }`}
          >
            <div className="font-medium">{role.name}</div>
            <div className="text-sm text-gray-400">{role.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;