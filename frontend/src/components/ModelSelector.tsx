interface Model {
  id: string;
  name: string;
  description: string;
}

const models: Model[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'gpt-4', name: 'GPT-4', description: 'More capable and accurate' },
  { id: 'claude-3', name: 'Claude 3', description: 'Balanced performance' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Select Model</h3>
      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedModel === model.id
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-900 dark:text-blue-100'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{model.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;