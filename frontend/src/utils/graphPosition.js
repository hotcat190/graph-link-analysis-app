export const calculatePosition = (ele) => {
    let x, y;

    if (ele.isNode()) {
        const pos = ele.renderedPosition();
        x = pos.x;
        y = pos.y;
    } else if (ele.isEdge()) {
        const boundingBox = ele.renderedBoundingBox();
        x = boundingBox.x1 + (boundingBox.w / 2);
        y = boundingBox.y1 + (boundingBox.h / 2);
    }

    return {
        display: 'block',
        position: 'absolute',
        left: `${x + 20}px`,
        top: `${y + 20}px`,
    };
};