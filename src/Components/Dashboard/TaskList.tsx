import React, { useState } from 'react';

interface Task {
    id: string;
    title: string;
    course: string;
    courseColor: string;
    dueTime: Date;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Complete Assignment 2',
            course: 'COMP 551',
            courseColor: 'bg-blue-500',
            dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            priority: 'high',
            completed: false
        },
        {
            id: '2',
            title: 'Read Chapter 5',
            course: 'PHIL 240',
            courseColor: 'bg-purple-500',
            dueTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            priority: 'medium',
            completed: false
        },
        {
            id: '3',
            title: 'Lab Report Draft',
            course: 'CHEM 212',
            courseColor: 'bg-green-500',
            dueTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            priority: 'low',
            completed: false
        }
    ]);
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    
    const formatDueTime = (dueTime: Date) => {
        const now = new Date();
        const diff = dueTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 1) return 'Due soon';
        if (hours < 24) return `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
        if (days === 1) return 'Due tomorrow';
        return `Due in ${days} days`;
    };
    
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };
    
    const toggleTask = (taskId: string) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };
    
    const addTask = () => {
        if (newTaskTitle.trim() && selectedCourse) {
            const newTask: Task = {
                id: Date.now().toString(),
                title: newTaskTitle,
                course: selectedCourse,
                courseColor: 'bg-blue-500',
                dueTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                priority: 'medium',
                completed: false
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
        }
    };
    
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.dueTime.getTime() - b.dueTime.getTime();
    });
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-mcgill-darkblue mb-4">📋 Upcoming Tasks</h2>
            
            {/* Add Task Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">Course</option>
                    <option value="COMP 551">COMP 551</option>
                    <option value="PHIL 240">PHIL 240</option>
                    <option value="CHEM 212">CHEM 212</option>
                </select>
                <button
                    onClick={addTask}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Add
                </button>
            </div>
            
            {/* Task List */}
            <div className="space-y-2">
                {sortedTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No tasks for today - you're all caught up! 🎉</p>
                    </div>
                ) : (
                    sortedTasks.map(task => (
                        <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                                task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                            } hover:shadow-sm transition`}
                        >
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                            />
                            
                            <div className={`w-1 h-1 rounded-full ${getPriorityColor(task.priority)}`} />
                            
                            <div className={`w-2 h-8 rounded ${task.courseColor}`} />
                            
                            <div className="flex-1">
                                <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                </p>
                                <p className="text-sm text-gray-600">{task.course}</p>
                            </div>
                            
                            <span className={`text-sm ${
                                task.completed ? 'text-gray-400' : 
                                task.priority === 'high' ? 'text-red-600 font-medium' : 'text-gray-600'
                            }`}>
                                {formatDueTime(task.dueTime)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskList;