{
    tickInterval: 32,
    unitLength: 64,
    dragCoef: 0.25,
    arrivalCoef: 0.5,
    zeroThreshold: 0.001,
    drawArrows: true,
    behaviors: [
        {
            _fn: alignment,
            opts: {
                on: false,
                weight: 0.05,
                radius: 2,
                color: '#bb9af7',
            },
        },
        {
            _fn: avoid,
            opts: {
                on: true,
                weight: 1.0,
                color: '#ff0000',
            },
        },
        {
            _fn: bound,
            opts: {
                on: true,
                weight: 1.0,
                color: '#0db9d7',
                boundary: {
                    minX: -5,
                    maxX: 5,
                    minY: -4,
                    maxY: 4,
                },
            },
        },
        {
            _fn: cohesion,
            opts: {
                on: false,
                radius: 2,
                weight: 0.1,
                color: '#7da6ff',
            },
        },
        {
            _fn: seek,
            opts: {
                on: true,
                weight: 1.0,
                color: '#b9f27c',
            },
        },
        {
            _fn: separation,
            opts: {
                on: true,
                weight: 1.0,
                color: '#ff7a93',
            },
        },
    ],
}
