import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TaskFormModal = ({ isOpen, onClose, taskToEdit, onTaskSaved }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: '',
        assignees: [],
        tags: '',
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch users for assignment
            const fetchUsers = async () => {
                try {
                    const response = await api.get('/users');
                    // Filter out current user and admins so they can't be assigned
                    const otherUsers = response.data.filter(u => u._id !== currentUser?._id && u.role !== 'admin');
                    setUsers(otherUsers);
                } catch (error) {
                    console.error('Failed to load users', error);
                }
            };
            fetchUsers();

            // Initialize form data
            setFormData({
                title: taskToEdit?.title || '',
                description: taskToEdit?.description || '',
                status: taskToEdit?.status || 'Todo',
                priority: taskToEdit?.priority || 'Medium',
                dueDate: taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : '',
                assignees: taskToEdit?.assignees ? taskToEdit.assignees.map(a => a._id) : [],
                tags: taskToEdit?.tags ? taskToEdit.tags.join(', ') : '',
            });
        }
    }, [isOpen, taskToEdit, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleAssignee = (userId) => {
        setFormData(prev => {
            const currentAssignees = prev.assignees || [];
            if (currentAssignees.includes(userId)) {
                return { ...prev, assignees: currentAssignees.filter(id => id !== userId) };
            } else {
                return { ...prev, assignees: [...currentAssignees, userId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Format tags as array
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            if (taskToEdit) {
                await api.put(`/tasks/${taskToEdit._id}`, payload);
                toast.success('Task updated successfully');
            } else {
                await api.post('/tasks', payload);
                toast.success('Task created successfully');
            }
            onTaskSaved();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || (taskToEdit ? 'Failed to update task' : 'Failed to create task'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-slate-800">
                        {taskToEdit ? 'Edit Task' : 'Create New Task'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            placeholder="e.g. Design, Urgent, Backend"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                            <div className="relative">
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign To (Select {'>'} 1)</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1">
                            {users.length === 0 ? (
                                <p className="text-sm text-slate-400 p-2 text-center">No other members available</p>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleAssignee(user._id)}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${formData.assignees.includes(user._id)
                                            ? 'bg-indigo-50 border border-indigo-200'
                                            : 'hover:bg-slate-100 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`text-sm ${formData.assignees.includes(user._id) ? 'font-medium text-indigo-900' : 'text-slate-700'}`}>
                                                {user.username}
                                            </span>
                                        </div>
                                        {formData.assignees.includes(user._id) && (
                                            <Check className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Click to select/deselect multiple members.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-50 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-semibold transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
