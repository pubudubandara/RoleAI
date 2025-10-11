import { useState } from 'react';
import { createRole } from '../api/roleApi';
import type { Role } from '../api/roleApi';
import toast from 'react-hot-toast';

interface RoleManagerProps {
  onRoleAdded?: (role: Role) => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ onRoleAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Role description is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newRole = await createRole({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      toast.success('Role created successfully!');
      
      // Reset form
      setFormData({ name: '', description: '' });
      setIsFormOpen(false);
      
      // Notify parent component
      if (onRoleAdded) {
        onRoleAdded(newRole);
      }
      
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Role Management</h3>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
          >
            + Add Role
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Role Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Code Reviewer, Travel Guide, Coach"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Role Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this role does and how it should behave..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-vertical"
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.description.length}/500 characters
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoleManager;