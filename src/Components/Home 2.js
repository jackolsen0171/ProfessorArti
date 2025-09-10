import React, { useState, useEffect } from "react";
import ProfessorGraph from "./ProfessorGraph";
import axios from "axios";
import "../App.css";
import "../styles/delete.css"

const API_BASE_URL = 'http://localhost:5001/api';

const Home = () => {
    const [graphData, setGraphData] = useState({
        nodes: [],
        links: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newProfessor, setNewProfessor] = useState("");

    // Fetch graph data from backend on component mount
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/graph/data`);
                if (response.data.success) {
                    setGraphData(response.data.data);
                    setError(null);
                } else {
                    throw new Error('Failed to fetch graph data');
                }
            } catch (err) {
                console.error('Error fetching graph data:', err);
                setError('Failed to load graph data from server. Using fallback data.');
                // Fallback to default data
                setGraphData({
                    nodes: [{ id: "Professor Arti", group: 0, size: 75 }],
                    links: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchGraphData();
    }, []);

    const addProfessor = () => {
        if (newProfessor.trim() === "") return;
        const newProf = { id: newProfessor, group: 1, size: 35 };
        setGraphData(prevData => ({
            nodes: [...prevData.nodes, newProf],
            links: [...prevData.links, { source: "Professor Arti", target: newProfessor, value: 2 }]
        }));
        setNewProfessor("");
    };

    const deleteProfessors = async () => {
        try {
            // Try to fetch fresh data from backend
            const response = await axios.get(`${API_BASE_URL}/graph/data`);
            if (response.data.success) {
                setGraphData(response.data.data);
            } else {
                throw new Error('Failed to refresh data');
            }
        } catch (err) {
            console.error('Error refreshing graph data:', err);
            // Fallback to reset
            const resetData = {
                nodes: [{ id: "Professor Arti", group: 0, size: 75 }],
                links: []
            };
            setGraphData(resetData);
        }
    }

    if (loading) {
        return (
            <div className="main-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '18px',
                    color: '#006B96'
                }}>
                    Loading Professor Arti's knowledge network...
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <section className="data-input-container">
                <h1>Welcome Jack</h1>
                <h2>Add Professor</h2>
                {error && (
                    <div style={{ 
                        color: '#ED1B2F', 
                        background: '#ffe6e6', 
                        padding: '10px', 
                        borderRadius: '5px',
                        margin: '10px 0',
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}
                <div className="data-input" >
                    <input
                        className="add-professor"
                        type="text"
                        value={newProfessor}
                        onChange={(e) => setNewProfessor(e.target.value)}
                        placeholder="Enter professor name"
                    />
                    <button id="add" onClick={addProfessor}>Add</button>
                </div>
            </section>
            
            <section className="graph-data">
                <div className="delete-container" >
                    <button onClick={deleteProfessors} className="button">
                        <svg viewBox="0 0 448 512" className="svgIcon">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
                        </svg>
                    </button>
                </div>
                <ProfessorGraph className="graph" data={graphData} setData={setGraphData} />
            </section>
        </div >
    );
};

export default Home;