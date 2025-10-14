import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RoleSelector from '../components/RoleSelector';
import ModelModal from '../components/ModelModal';
import * as modelApi from '../api/modelApi';
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
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalMode, setModelModalMode] = useState<'add' | 'edit'>('add');
  const [editingModel, setEditingModel] = useState<modelApi.ModelConfig | null>(null);
  const [models, setModels] = useState<modelApi.ModelConfig[]>([]);
  const [selectedModelConfigId, setSelectedModelConfigId] = useState<number | undefined>(undefined);

  // Load roles on component mount
  useEffect(() => {
    loadRoles();
    loadModels();
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

  const loadModels = async () => {
    try {
      const data = await modelApi.listModels();
      setModels(data);
      // Auto-select first model if none selected
      if (!selectedModelConfigId && data && data.length > 0) {
        setSelectedModelConfigId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load models', e);
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
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
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
      className="w-full flex overflow-hidden min-h-0 relative"
      style={{ height: 'calc(100vh - 64px)' }} // assumes navbar height = 64px (h-16)
    >
      {/* Toggle button for small screens */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-18 left-2 z-10 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      >
        {isSidebarOpen ? '<' : '>'}
      </button>

  {/* Sidebar */}
  <div className={`w-80 bg-gray-900 p-4 border-r border-gray-700 ${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col h-full overflow-y-auto min-h-0`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white pl-6 md:pl-0">Roles</h2>
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
              selectedRoles={selectedRoles}
              onRolesChange={setSelectedRoles}
              onEditRole={handleEditRole}
            />
          )}
        </div>
        <div className="mt-4 ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Models</h3>
            <button onClick={() => { setEditingModel(null); setModelModalMode('add'); setIsModelModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">+ Add Model</button>
          </div>
          {/* Removed separate ModelSelector: using saved models only */}
          <div className="mt-2">
            <div className="block text-xs text-gray-300 mb-1">Select saved model (required)</div>
            <div className="space-y-2">
              {models.length === 0 && (
                <div className="text-xs text-gray-400">No saved models. Add one to continue.</div>
              )}
              {models.map((m) => (
                <div key={m.id} className={`w-full p-3 rounded-lg border transition-colors ${
                  selectedModelConfigId === m.id
                    ? 'bg-blue-900 border-blue-500 text-blue-100'
                    : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => setSelectedModelConfigId(m.id)}
                      className="text-left flex-1"
                    >
                      <div className="font-medium">{m.label || m.modelId}</div>
                      <div className="text-xs text-gray-400">Provider: {m.provider} • Model: {m.modelId}</div>
                    </button>
                    <button
                      onClick={() => { setEditingModel(m); setModelModalMode('edit'); setIsModelModalOpen(true); }}
                      className="text-sm px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600"
                      title="Edit model"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
        <ChatBox selectedRoles={selectedRoles} selectedModel="gemini-2.5-pro" roles={roles} selectedModelConfigId={selectedModelConfigId} />
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        onDelete={handleDeleteRole}
        role={editingRole}
        mode={modalMode}
      />
      <ModelModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        mode={modelModalMode}
        model={editingModel}
        onSave={async (data: { provider: string; modelId: string; label?: string; apiKey?: string }) => {
          try {
            if (modelModalMode === 'edit' && editingModel?.id) {
              await modelApi.updateModel(editingModel.id, data);
              toast.success('Model updated');
            } else {
              await modelApi.createModel(data as any);
              toast.success('Model saved');
            }
            setIsModelModalOpen(false);
            setEditingModel(null);
            loadModels();
          } catch (e) {
            toast.error('Failed to save model');
          }
        }}
        onDelete={async (id: number) => {
          try {
            await modelApi.deleteModel(id);
            toast.success('Model deleted');
            // Adjust selection if needed
            if (selectedModelConfigId === id) {
              const remaining = models.filter(m => m.id !== id);
              setSelectedModelConfigId(remaining.length > 0 ? remaining[0].id : undefined);
            }
            setIsModelModalOpen(false);
            setEditingModel(null);
            loadModels();
          } catch (e) {
            toast.error('Failed to delete model');
          }
        }}
      />
    </div>
  );
};

export default ChatPage;