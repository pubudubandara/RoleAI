import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RoleSelector from '../components/RoleSelector';
import ModelSelector from '../components/ModelSelector';
import ChatBox from '../components/ChatBox';
import RoleModal from '../components/RoleModal';
import * as roleApi from '../api/roleApi';

interface Role {
  id?: number;
  name: string;
  description: string;
  userId?: number;
}

const ChatPage = () => {
  const [selectedRole, setSelectedRole] = useState<number | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-lite');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Load roles on component mount
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const fetchedRoles = await roleApi.getAllRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveRole = async (roleData: Role) => {
    try {
      if (editingRole && editingRole.id) {
        // Update existing role
        const updatedRole = await roleApi.updateRole(editingRole.id, {
          name: roleData.name,
          description: roleData.description
        });
        setRoles(prev => prev.map(role =>
          role.id === editingRole.id ? updatedRole : role
        ));
        toast.success('Role updated successfully!');
      } else {
        // Add new role
        const newRole = await roleApi.createRole({
          name: roleData.name,
          description: roleData.description
        });
        setRoles(prev => [...prev, newRole]);
        toast.success('Role created successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save role');
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await roleApi.deleteRole(roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
      // Clear selection if the deleted role was selected
      if (selectedRole === roleId) {
        setSelectedRole(undefined);
      }
      toast.success('Role deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  return (
    <div
      className="w-full flex overflow-hidden min-h-0"
      style={{ height: 'calc(100vh - 64px)' }} // assumes navbar height = 64px (h-16)
    >
      <div className="w-80 bg-gray-900 p-4 border-r border-gray-700 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Roles</h2>
          <button
            onClick={handleAddRole}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            + Add Role
          </button>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center text-gray-400 py-4">Loading roles...</div>
          ) : (
            <RoleSelector
              roles={roles}
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
              onEditRole={handleEditRole}
            />
          )}
        </div>
        <div className="mt-4">
          <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        <ChatBox selectedRole={selectedRole} selectedModel={selectedModel} />
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