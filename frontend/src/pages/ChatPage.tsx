import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RoleSelector from '../components/RoleSelector';
import ModelModal from '../components/ModelModal';
import * as modelApi from '../api/modelApi';
import ChatBox from '../components/ChatBox';
import RoleModal from '../components/RoleModal';
import * as roleApi from '../api/roleApi';
import * as chatSessionApi from '../api/chatSessionApi';

interface Role {
  id?: number;
  name: string;
  description: string;
  userId?: number;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
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
  const [sessions, setSessions] = useState<chatSessionApi.ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<chatSessionApi.ChatSession | null>(null);

  // Load roles on component mount
  useEffect(() => {
    loadRoles();
    loadModels();
    // load sessions and handle routing
    (async () => {
      try {
        const list = await chatSessionApi.listSessions();
        setSessions(list);
        if (chatId) {
          const exists = list.find(s => s.id === chatId);
          if (exists) {
            setCurrentSessionId(chatId);
          } else {
            // invalid id in URL, navigate to first or create new
            if (list.length > 0) {
              navigate(`/chat/${list[0].id}`, { replace: true });
            } else {
              const created = await chatSessionApi.createSession();
              setSessions([created]);
              setCurrentSessionId(created.id);
              navigate(`/chat/${created.id}`, { replace: true });
            }
          }
        } else {
          // No chatId in URL
          if (list.length > 0) {
            navigate(`/chat/${list[0].id}`, { replace: true });
          } else {
            const created = await chatSessionApi.createSession();
            setSessions([created]);
            setCurrentSessionId(created.id);
            navigate(`/chat/${created.id}`, { replace: true });
          }
        }
      } catch (e) {
        console.error('Failed to load sessions', e);
      }
    })();
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
        <ChatBox 
          selectedRoles={selectedRoles} 
          selectedModel="gemini-2.5-pro" 
          roles={roles} 
          selectedModelConfigId={selectedModelConfigId} 
          sessionId={currentSessionId ?? undefined}
          onAfterUserMessage={async () => {
            try {
              const list = await chatSessionApi.listSessions();
              setSessions(list);
            } catch {}
          }}
        />
      </div>

      {/* History toggle handle - sits at the edge of the history bar */}
      <button
        onClick={() => setIsHistoryOpen(prev => !prev)}
        className="fixed z-20 bottom-28  bg-gray-800 text-white px-3 py-2 rounded-l-lg rounded-r-lg shadow-lg hover:bg-gray-700 transition-colors -translate-y-1/2"
        style={{ right: isHistoryOpen ? '18rem' : '0.5rem' }}
        aria-label="Toggle chat history"
        title="Toggle chat history"
      >
        {isHistoryOpen ? '>' : 'History'}
      </button>

      {/* Right Sidebar - Chat History */}
      <div className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-72 bg-gray-900 border-l border-gray-700 transform transition-transform duration-200 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}> 
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <div className="font-semibold">Chat History</div>
          <button
            onClick={async () => {
              const created = await chatSessionApi.createSession();
              setSessions(prev => [created, ...prev]);
              setCurrentSessionId(created.id);
              navigate(`/chat/${created.id}`);
            }}
            className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700"
          >
            + New
          </button>
        </div>
        <div className="p-2 space-y-1">
          {sessions.length === 0 && (
            <div className="text-xs text-gray-400 p-3">No chats yet.</div>
          )}
          {sessions.map(s => (
            <div key={s.id} className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${currentSessionId === s.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
              <button onClick={() => { setCurrentSessionId(s.id); navigate(`/chat/${s.id}`); }} className="flex-1 text-left truncate pr-2">{s.title || `Chat ${s.id}`}</button>
              <button
                title="Delete chat"
                onClick={() => { setDeleteTarget(s); setShowDeleteChatConfirm(true); }}
                className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Chat Confirmation Modal */}
      {showDeleteChatConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the chat "{deleteTarget.title || deleteTarget.id}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteChatConfirm(false); setDeleteTarget(null); }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await chatSessionApi.deleteSession(deleteTarget.id);
                    const next = sessions.filter(x => x.id !== deleteTarget.id);
                    setSessions(next);
                    // If we deleted the current chat, navigate appropriately
                    if (currentSessionId === deleteTarget.id) {
                      if (next.length > 0) {
                        setCurrentSessionId(next[0].id);
                        navigate(`/chat/${next[0].id}`);
                      } else {
                        const created = await chatSessionApi.createSession();
                        setSessions([created]);
                        setCurrentSessionId(created.id);
                        navigate(`/chat/${created.id}`);
                      }
                    }
                  } catch (e) {
                    console.error('Failed to delete chat', e);
                    toast.error('Failed to delete chat');
                  } finally {
                    setShowDeleteChatConfirm(false);
                    setDeleteTarget(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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