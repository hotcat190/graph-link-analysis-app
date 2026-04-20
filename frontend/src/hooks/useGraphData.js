import { useState, useEffect } from 'react';
import axios from 'axios';

export const useGraphData = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/graph`)
            .then(response => setData(response.data.elements))
            .catch(error => console.error("Error fetching graph data:", error));
    }, []);

    return data;
};