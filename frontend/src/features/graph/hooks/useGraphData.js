import { useState, useEffect } from 'react';
import { getCaseGraph } from '../../cases/api/casesApi';

export const useGraphData = (caseId) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!caseId) {
            setData(null);
            return;
        }

        getCaseGraph(caseId)
            .then(resData => setData(resData.elements))
            .catch(error => {
                console.error("Error fetching graph data for case:", caseId, error);
                setData(null);
            });
    }, [caseId]);

    return data;
};
