export const personSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);

export const phoneSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`);

export const companySvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`);

export const bankSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`);

export const cytoscapeStyles = [
    {
        selector: 'node',
        style: {
            'width': 48,
            'height': 48,
            'background-color': '#0f172a',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#cbd5e1',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            'font-family': 'Inter, sans-serif',
            'font-weight': 'bold',
            'text-transform': 'uppercase',
            'background-position-x': '50%',
            'background-position-y': '50%',
            'background-clip': 'node',
            'background-width': '28px',
            'background-height': '28px',
            'text-background-opacity': 1,
            'text-background-color': '#0f172a',
            'text-background-shape': 'roundrectangle',
            'text-background-padding': 4,
            'text-border-opacity': 1,
            'text-border-width': 2,
        }
    },
    {
        selector: 'node[type="person"]',
        style: {
            'border-color': '#3b82f6',
            'text-border-color': '#3b82f6',
            'background-image': `data:image/svg+xml;utf8,${personSvg}`
        }
    },
    {
        selector: 'node[type="phone"]',
        style: {
            'border-color': '#f59e0b',
            'text-border-color': '#f59e0b',
            'background-image': `data:image/svg+xml;utf8,${phoneSvg}`
        }
    },
    {
        selector: 'node[type="company"]',
        style: {
            'border-color': '#a855f7',
            'text-border-color': '#a855f7',
            'background-image': `data:image/svg+xml;utf8,${companySvg}`
        }
    },
    {
        selector: 'node[type="bank"]',
        style: {
            'border-color': '#22c55e',
            'text-border-color': '#22c55e',
            'background-image': `data:image/svg+xml;utf8,${bankSvg}`
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-width': 3,
            'border-color': '#60a5fa',
            'text-border-color': '#60a5fa',
            'text-border-width': 3,
            'shadow-blur': 20,
            'shadow-color': '#3b82f6',
            'shadow-opacity': 0.6,
            'background-color': '#1e3a8a',
            'text-background-color': '#1e3a8a'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 1.5,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'font-family': 'monospace',
            'color': '#94a3b8',
            'text-background-opacity': 1,
            'text-background-color': '#07080a',
            'text-background-padding': 2,
            'text-border-opacity': 1,
            'text-border-color': '#1e293b',
            'text-border-width': 1,
            'text-rotation': 'autorotate'
        }
    },
    {
        selector: 'edge:selected',
        style: {
            'width': 2,
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'color': '#38bdf8'
        }
    },
    {
        selector: 'node.search-highlight',
        style: {
            'border-width': 4,
            'border-color': '#fbbf24',
            'shadow-blur': 25,
            'shadow-color': '#fbbf24',
            'shadow-opacity': 0.8,
            'width': 60,
            'height': 60
        }
    },
    {
        selector: 'node.faded',
        style: {
            'opacity': 0.15
        }
    },
    {
        selector: 'edge.faded',
        style: {
            'opacity': 0.05
        }
    }
];
