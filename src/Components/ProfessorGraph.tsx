import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";

const ProfessorGraph = ({ data, setData }) => {

    const svgRef = useRef();
    const navigate = useNavigate?.();

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        // McGill University color palette for nodes
        const mcgillColors = [
            '#ED1B2F', // McGill Red (primary)
            '#006B96', // Mediterranean
            '#0F4C75', // Night Blue
            '#2D5016', // Forest Green
            '#8B9DC3', // Periwinkle
            '#6B7280', // Slate
            '#C41E3A', // Dark Red
            '#374151', // Dark Gray
        ];
        const color = d3.scaleOrdinal(mcgillColors);

        const links = data.links.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d }));

        d3.select(svgRef.current).selectAll("*").remove(); // Clear previous SVG elements

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .style("max-width", "100%")
            .style("height", "100vh");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(300))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked);

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", d => d.size || 5)
            .attr("fill", d => color(d.group))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", (event, d) => handleNodeClick(d))
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("r", d.size * 1.5);
                labels.filter(label => label.id === d.id).attr("dy", d.size * 1.5 + 27); // Move text inline with node
            })
            .on("mouseout", function (event, d) {
                d3.select(this).transition().duration(200).attr("r", d.size);
                labels.filter(label => label.id === d.id).attr("dy", d.size + 27); // Reset text position
            });

        const labels = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.size + 30) // Position the label below the node
            .style("font-size", "32px")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(d => d.id);

        function ticked() {
            const isMobile = window.innerWidth < 768;

            const bounds = {
                minX: isMobile ? 50 : 120,
                maxX: isMobile ? width - 50 : width - 120,
                minY: isMobile ? 90 : 10,
                maxY: isMobile ? height - 180 : height,
            };

            // Keep nodes inside the boundaries
            node.attr("cx", d => d.x = Math.max(bounds.minX, Math.min(bounds.maxX, d.x)))
                .attr("cy", d => d.y = Math.max(bounds.minY, Math.min(bounds.maxY, d.y)));

            labels.attr("x", d => d.x)
                .attr("y", d => d.y);

            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        function handleNodeClick(d) {
            if (navigate && d.group === 1) { // Ensure it's a professor node and navigation is available
                navigate(`/chatbot/${encodeURIComponent(d.id)}`);
            }
        }


        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => simulation.stop();
    }, [data, navigate]);

    return <svg ref={svgRef}></svg>;
};

export default ProfessorGraph;
