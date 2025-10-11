interface Model {
  id: string;
  name: string;
  description: string;
}

const models: Model[] = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Lightweight, low-latency, cost-effective' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-white">Select Model</h3>
      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedModel === model.id
                ? 'bg-blue-900 border-blue-500 text-blue-100'
                : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            }`}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-sm text-gray-400">{model.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;