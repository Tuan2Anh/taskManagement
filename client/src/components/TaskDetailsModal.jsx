import { useState, useEffect } from 'react';
import Modal from './Modal';
import {
    fetchSubtasksAPI, fetchCommentsAPI, fetchLogsAPI,
    createSubtaskAPI, updateSubtaskAPI, deleteSubtaskAPI,
    createCommentAPI
} from '../apis/taskApi';
import { Trash2, Send, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { toast } from 'react-toastify';

const TaskDetailsModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
    const [subtasks, setSubtasks] = useState([]);
    const [comments, setComments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState('subtasks'); // subtasks, comments, logs

    useEffect(() => {
        if (task && isOpen) {
            fetchDetails();
        }
    }, [task, isOpen]);

    const fetchDetails = async () => {
        try {
            const [subtasksData, commentsData, logsData] = await Promise.all([
                fetchSubtasksAPI(task._id),
                fetchCommentsAPI(task._id),
                fetchLogsAPI(task._id),
            ]);
            setSubtasks(subtasksData);
            setComments(commentsData);
            setLogs(logsData);
        } catch (error) {
            console.error('Failed to fetch details', error);
            toast.error('Failed to load task details');
        }
    };

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        try {
            await createSubtaskAPI(task._id, { title: newSubtask, status: 'Todo' });
            setNewSubtask('');
            fetchDetails(); // Refresh
            toast.success('Subtask added');
        } catch (error) {
            toast.error('Failed to add subtask');
        }
    };

    const handleToggleSubtask = async (subtask) => {
        try {
            const newStatus = subtask.status === 'Done' ? 'Todo' : 'Done';
            await updateSubtaskAPI(subtask._id, { status: newStatus });
            fetchDetails();
        } catch (error) {
            toast.error('Failed to update subtask');
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        try {
            await deleteSubtaskAPI(subtaskId);
            fetchDetails();
            toast.success('Subtask deleted');
        } catch (error) {
            toast.error('Failed to delete subtask');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await createCommentAPI(task._id, { content: newComment });
            setNewComment('');
            fetchDetails();
            toast.success('Comment added');
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
            <div className="mb-4">
                <p className="text-gray-600 mb-2">{task.description}</p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex gap-4">
                        <span className="font-medium">Status: {task.status}</span>
                        <span className="font-medium">Priority: {task.priority}</span>
                        <span className="font-medium">Created By: {task.createdBy?.username || 'Unknown'}</span>
                    </div>
                    <div>
                        <span className="font-medium mr-2">Assignees:</span>
                        {task.assignees && task.assignees.length > 0 ? (
                            <span className="text-slate-700 font-medium">
                                {task.assignees.map(a => a.username).join(', ')}
                            </span>
                        ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-b mb-4 flex space-x-4 text-sm font-medium text-gray-500">
                <button
                    onClick={() => setActiveTab('subtasks')}
                    className={clsx('pb-2 border-b-2 transition-colors', activeTab === 'subtasks' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700')}
                >
                    Subtasks ({subtasks.length})
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={clsx('pb-2 border-b-2 transition-colors', activeTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700')}
                >
                    Comments ({comments.length})
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={clsx('pb-2 border-b-2 transition-colors', activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700')}
                >
                    History ({logs.length})
                </button>
            </div>

            <div className="min-h-[200px]">
                {activeTab === 'subtasks' && (
                    <div>
                        <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add new subtask..."
                                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">Add</button>
                        </form>
                        <ul className="space-y-2">
                            {subtasks.map((st) => (
                                <li key={st._id} className="flex items-center justify-between p-2 bg-gray-50 rounded group">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleSubtask(st)} className={clsx("w-5 h-5 flex items-center justify-center border rounded-full", st.status === 'Done' ? 'bg-green-100 border-green-500 text-green-600' : 'border-gray-400 text-transparent hover:border-blue-500')}>
                                            <CheckCircle className="w-3 h-3" />
                                        </button>
                                        <span className={clsx(st.status === 'Done' && 'line-through text-gray-400')}>{st.title}</span>
                                    </div>
                                    <button onClick={() => handleDeleteSubtask(st._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                            {subtasks.length === 0 && <p className="text-gray-400 text-sm italic">No subtasks yet.</p>}
                        </ul>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                            {comments.map((c) => (
                                <div key={c._id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                        {c.user?.username?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                                            <p className="text-xs font-bold text-gray-700 mb-1">{c.user?.username}</p>
                                            <p className="text-sm text-gray-800">{c.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{format(new Date(c.createdAt), 'MMM d, p')}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-gray-400 text-sm italic">No comments yet.</p>}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button type="submit" className="text-blue-600 hover:text-blue-700 p-2">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <ul className="space-y-4">
                        {logs.map((log) => (
                            <li key={log._id} className="flex gap-3 text-sm">
                                <div className="mt-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-gray-800">
                                        <span className="font-semibold">{log.user?.username}</span>: {log.details}
                                    </p>
                                    <p className="text-xs text-gray-500">{format(new Date(log.createdAt), 'MMM d, yyyy p')}</p>
                                </div>
                            </li>
                        ))}
                        {logs.length === 0 && <p className="text-gray-400 text-sm italic">No activity yet.</p>}
                    </ul>
                )}
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;
