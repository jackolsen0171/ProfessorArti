import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../FileUpload';

const QuickActions: React.FC = () => {
    const navigate = useNavigate();
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    const handleViewGraph = () => {
        navigate('/graph');
    };
    
    const handleScheduleStudy = () => {
        // This would open a scheduling modal or integrate with calendar
        console.log('Schedule study session');
    };
    
    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                    >
                        <span className="text-2xl mb-2">✏️</span>
                        <span className="text-sm font-medium text-gray-700">Add Task</span>
                    </button>
                    
                    <button
                        onClick={handleScheduleStudy}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                    >
                        <span className="text-2xl mb-2">📅</span>
                        <span className="text-sm font-medium text-gray-700">Schedule Study</span>
                    </button>
                    
                    <button
                        onClick={handleViewGraph}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                    >
                        <span className="text-2xl mb-2">🕸️</span>
                        <span className="text-sm font-medium text-gray-700">Knowledge Graph</span>
                    </button>
                    
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
                    >
                        <span className="text-2xl mb-2">📄</span>
                        <span className="text-sm font-medium text-gray-700">Upload Doc</span>
                    </button>
                </div>
            </div>
            
            {/* Add Task Modal */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Add New Task</h3>
                        
                        <input
                            type="text"
                            placeholder="Task title..."
                            className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        
                        <select className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option>Select Course</option>
                            <option>COMP 551</option>
                            <option>CHEM 212</option>
                            <option>PHIL 240</option>
                        </select>
                        
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddTaskModal(false)}
                                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Add task logic here
                                    setShowAddTaskModal(false);
                                }}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Upload Document</h3>
                        
                        <FileUpload />
                        
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="w-full mt-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuickActions;