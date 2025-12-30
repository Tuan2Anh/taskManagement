import { Trash2, Edit, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const TaskItem = ({ task, onDelete, onUpdateStatus, onEdit, onViewDetails }) => {
    const priorityColors = {
        Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200',
        High: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    const statusColors = {
        Todo: 'bg-slate-100 text-slate-600 border-slate-200',
        'In Progress': 'bg-blue-100 text-blue-600 border-blue-200',
        Done: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    };

    const formattedDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d, y') : null;

    return (
        <div
            onClick={() => onViewDetails(task)}
            className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 font-medium">
                        Created by {task.createdBy?.username || 'Unknown'}
                    </span>
                    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-semibold border w-fit', priorityColors[task.priority])}>
                        {task.priority}
                    </span>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">
                {task.title}
            </h3>

            <p className="text-slate-500 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                {task.description || "No description provided."}
            </p>

            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
                <select
                    value={task.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                    className={clsx('text-xs font-semibold px-2.5 py-1 rounded-lg border focus:ring-2 ring-offset-1 focus:outline-none cursor-pointer appearance-none', statusColors[task.status])}
                >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <div className="flex items-center text-xs text-slate-400 font-medium">
                    {formattedDate && (
                        <div className="flex items-center mr-3" title="Due Date">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {formattedDate}
                        </div>
                    )}
                    <div className="flex -space-x-2 overflow-hidden">
                        {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.map((assignee, index) => (
                                <div
                                    key={assignee._id || index}
                                    className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 border-2 border-white ring-1 ring-slate-100"
                                    title={`Assignee: ${assignee.username}`}
                                >
                                    {assignee.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                            ))
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200" title="Unassigned">
                                ?
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
