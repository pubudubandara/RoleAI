import { useState } from 'react';
import RoleSelector from '../components/RoleSelector';
import ModelSelector from '../components/ModelSelector';
import ChatBox from '../components/ChatBox';
import RoleModal from '../components/RoleModal';

interface Role {
  id?: string;
  name: string;
  description: string;
}

const ChatPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Assistant', description: 'Helpful AI assistant' },
    { id: '2', name: 'Teacher', description: 'Educational instructor' },
    { id: '3', name: 'Friend', description: 'Casual conversation partner' },
    { id: '4', name: 'Expert', description: 'Specialized knowledge provider' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleAddRole = () => {
    setEditingRole(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveRole = (roleData: Role) => {
    if (editingRole) {
      // Update existing role
      setRoles(prev => prev.map(role =>
        role.id === editingRole.id
          ? { ...role, name: roleData.name, description: roleData.description }
          : role
      ));
    } else {
      // Add new role
      const newRole: Role = {
        id: Date.now().toString(), // Simple ID generation using timestamp as string
        name: roleData.name,
        description: roleData.description,
      };
      setRoles(prev => [...prev, newRole]);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
    // Clear selection if the deleted role was selected
    if (selectedRole === roleId) {
      setSelectedRole('');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex">
        <div className="w-80 bg-gray-900 p-4 border-r border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Roles</h2>
            <button
              onClick={handleAddRole}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              + Add Role
            </button>
          </div>

          <RoleSelector
            roles={roles}
            selectedRole={selectedRole}
            onRoleSelect={setSelectedRole}
            onEditRole={handleEditRole}
          />
          <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
        </div>
        <div className="flex-1 p-4 bg-gray-900">
          <ChatBox selectedRole={selectedRole} selectedModel={selectedModel} />
        </div>
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        onDelete={handleDeleteRole}
        role={editingRole}
        mode={modalMode}
      />
    </div>
  );
};

export default ChatPage;