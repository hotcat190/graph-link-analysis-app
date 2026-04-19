export const cytoscapeStyles = [
    {
        selector: 'node',
        style: {
            'width': 45,
            'height': 45,
            'background-color': '#2a2a2a',
            'border-width': 3,
            'label': 'data(label)',
            'color': '#ecf0f1',
            'font-size': '12px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'font-family': 'sans-serif'
        }
    },
    {
        selector: 'node[type="person"]',
        style: {
            'border-color': '#f1c40f'
        }
    },
    {
        selector: 'node[type="phone"]',
        style: {
            'border-color': '#e67e22'
        }
    },
    {
        selector: 'node[type="company"]',
        style: {
            'border-color': '#e74c3c'
        }
    },
    {
        selector: 'node[type="bank"]',
        style: {
            'border-color': '#3498db'
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-width': 5,
            'border-color': '#fff',
            'shadow-blur': 15,
            'shadow-color': '#fff',
            'shadow-opacity': 0.8
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#5c5c5c',
            'target-arrow-color': '#5c5c5c',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#9e9e9e',
            'text-background-opacity': 1,
            'text-background-color': '#1e1e1e',
            'text-background-padding': 3,
            'text-rotation': 'autorotate'
        }
    },
    {
        selector: 'edge:selected',
        style: {
            'width': 4,
            'line-color': '#ecf0f1',
            'target-arrow-color': '#ecf0f1'
        }
    }
];