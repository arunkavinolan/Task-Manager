import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar, Clock, CheckSquare, Square, Trash2, Edit3 } from 'lucide-react';

const TaskManagementDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'todo'
    };
    setTasks([...tasks, newTask]);
    setShowAddModal(false);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    updateTask(id, { status: newStatus });
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTask(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const TaskModal = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.title.trim()) {
        onSave(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                {task ? 'Update' : 'Add'} Task
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TaskCard = ({ task }) => {
    const priorityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`bg-white p-4 rounded-lg shadow-md border-l-4 cursor-move transition-transform hover:scale-105 ${
          task.status === 'completed' ? 'border-l-green-500 opacity-75' : 
          task.priority === 'high' ? 'border-l-red-500' :
          task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              {task.status === 'completed' ? 
                <CheckSquare className="w-5 h-5" /> : 
                <Square className="w-5 h-5" />
              }
            </button>
            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEditingTask(task)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TaskColumn = ({ title, status, tasks, icon: Icon }) => (
    <div className="flex-1 min-w-80">
      <div className="bg-gray-50 rounded-lg p-4 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
            {tasks.length}
          </span>
        </div>
        <div
          className="space-y-3 min-h-96"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Management Dashboard</h1>
              <p className="text-gray-600">Organize and track your tasks efficiently</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Columns */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          <TaskColumn 
            title="To Do" 
            status="todo" 
            tasks={todoTasks}
            icon={Square}
          />
          <TaskColumn 
            title="In Progress" 
            status="in-progress" 
            tasks={inProgressTasks}
            icon={Clock}
          />
          <TaskColumn 
            title="Completed" 
            status="completed" 
            tasks={completedTasks}
            icon={CheckSquare}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <TaskModal
            onClose={() => setShowAddModal(false)}
            onSave={addTask}
          />
        )}
        
        {editingTask && (
          <TaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={(data) => {
              updateTask(editingTask.id, data);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManagementDashboard;