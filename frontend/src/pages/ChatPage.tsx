import { useState } from 'react';
import RoleSelector from '../components/RoleSelector';
import ModelSelector from '../components/ModelSelector';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-1">
        <div className="w-1/4 min-w-[300px] p-6 bg-gray-800 border-r border-gray-700">
          <RoleSelector selectedRole={selectedRole} onRoleSelect={setSelectedRole} />
          <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} />
        </div>
        <div className="flex-1 p-4">
          <ChatBox selectedRole={selectedRole} selectedModel={selectedModel} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
