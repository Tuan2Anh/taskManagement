import { useState, useEffect } from 'react';
import { fetchTasksAPI, deleteTaskAPI, updateTaskAPI, exportTasksAPI } from '../apis/taskApi';
import { fetchUsersAPI } from '../apis/userApi';
import TaskItem from '../components/TaskItem';
import TaskFilter from '../components/TaskFilter';
import TaskFormModal from '../components/TaskFormModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import { Plus, Download } from 'lucide-react';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTasks: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        priority: '',
        assignee: '',
        dueDate: '',
        tags: '',
    });

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async (page = 1) => {
        try {
            setLoading(true);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.assignee) params.assignee = filters.assignee;
            if (filters.dueDate) params.dueDate = filters.dueDate;
            if (filters.tags) params.tags = filters.tags;
            params.page = page;
            params.limit = 9; // 9 items per page (3x3 grid)

            const data = await fetchTasksAPI(params);
            setTasks(data.tasks);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalTasks: data.totalTasks,
            });
        } catch (error) {
            toast.error('Failed to fetch tasks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await fetchUsersAPI();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchTasks(1); // Reset to page 1 when filters change
    }, [filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTasks(newPage);
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTaskAPI(taskId);
                toast.success('Task deleted successfully');
                fetchTasks();
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await updateTaskAPI(taskId, { status: newStatus });
            toast.success('Task status updated');
            fetchTasks(); // Optional: optimistic update
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (task) => {
        setTaskToEdit(task);
        setIsFormOpen(true);
    }

    const handleCreate = () => {
        setTaskToEdit(null);
        setIsFormOpen(true);
    }

    const handleTaskSaved = () => {
        fetchTasks();
    }

    const handleViewDetails = (task) => {
        setSelectedTask(task);
    }

    const handleExport = async () => {
        try {
            const data = await exportTasksAPI();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tasks.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to export tasks');
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Task Board</h2>
                            <p className="text-slate-500 mt-1">Manage your team's workload and track progress.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Export Excel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Task
                            </button>
                        </div>
                    </header>

                    {/* Filters & Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <TaskFilter filters={filters} setFilters={setFilters} users={users} />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="h-56 bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                                        <div className="h-6 bg-slate-100 rounded w-8"></div>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                    <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between">
                                        <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                                        <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No tasks found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                                Your task list is empty. Create a new task to get started tracking your work.
                            </p>
                            <button
                                onClick={handleCreate}
                                className="text-indigo-600 font-medium hover:text-indigo-800 underline underline-offset-4"
                            >
                                Add your first task
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {tasks.map((task) => (
                                <TaskItem
                                    key={task._id}
                                    task={task}
                                    onDelete={handleDelete}
                                    onUpdateStatus={handleUpdateStatus}
                                    onEdit={handleEdit}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && tasks.length > 0 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-slate-600 font-medium">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <TaskFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                taskToEdit={taskToEdit}
                onTaskSaved={handleTaskSaved}
            />

            <TaskDetailsModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onTaskUpdated={fetchTasks}
            />
        </div>
    );
};

export default Dashboard;
