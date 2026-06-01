import { useState, useEffect } from 'react';
import axios from 'axios';

export const useGraphData = (caseId) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!caseId) {
            setData(null);
            return;
        }

        axios.get(`${import.meta.env.VITE_API_URL}/api/cases/${caseId}/graph`)
            .then(response => setData(response.data.elements))
            .catch(error => {
                console.error("Error fetching graph data for case:", caseId, error);
                setData(null);
            });
    }, [caseId]);

    return data;
};