import React, { useState, useEffect } from "react";
import ProfessorGraph from "./ProfessorGraph";
import "../App.css";
import "../styles/delete.css"

const Home = () => {
    const [graphData, setGraphData] = useState(() => {
        const savedData = localStorage.getItem("graphData");
        return savedData ? JSON.parse(savedData) : {
            nodes: [{ id: "Professor Arti", group: 0, size: 75 }],
            links: []
        };
    });

    const [newProfessor, setNewProfessor] = useState("");

    useEffect(() => {
        localStorage.setItem("graphData", JSON.stringify(graphData));
    }, [graphData]);

    const addProfessor = () => {
        if (newProfessor.trim() === "") return;
        const newProf = { id: newProfessor, group: 1, size: 35 };
        setGraphData(prevData => ({
            nodes: [...prevData.nodes, newProf],
            links: [...prevData.links, { source: "Professor Arti", target: newProfessor, value: 2 }]
        }));
        setNewProfessor("");
    };

    const deleteProfessors = () => {

        const resetData = {
            nodes: [{ id: "Professor Arti", group: 0, size: 75 }],
            links: []
        };

        setGraphData(resetData);
        localStorage.setItem("graphData", JSON.stringify(resetData));
    }

    return (
        <div className="main-container">
            <section className="data-input-container">
                <h1>Welcome Jack</h1>
                <h2>Add Professor</h2>
                <div className="data-input" >
                    <input
                        type="text"
                        value={newProfessor}
                        onChange={(e) => setNewProfessor(e.target.value)}
                        placeholder="Enter professor name"
                    />
                    <button id="add" onClick={addProfessor}>Add</button>
                </div>


            </section>
            <section className="graph-data">

                {/* <div className="graph-container" >
                    <ProfessorGraph className="" data={graphData} setData={setGraphData} />
                </div> */}
                <ProfessorGraph className="graph" data={graphData} setData={setGraphData} />

                <div className="delete-container" >
                    <button onClick={deleteProfessors} class="button">
                        <svg viewBox="0 0 448 512" class="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg>
                    </button>
                </div>



            </section>


        </div >
    );
};

export default Home;
