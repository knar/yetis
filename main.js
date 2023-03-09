import { alignment, avoid, bound, cohesion, seek, separation } from './behaviors.js'
import { draw, setup } from './draw.js'
import {
    add,
    circleRectIntersects,
    dist,
    div,
    heading,
    mag,
    rand,
    scale,
    sub,
    vec,
    zero,
} from './util.js'

const ctx = document.getElementById('canvas').getContext('2d')

const cfg = {
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

const state = {
    yetis: [],
}

while (state.yetis.length < 2) {
    state.yetis.push({
        pos: vec(rand(-3, 3), 0),
        vel: vec(0, 0),
        radius: 0.4,
        maxVel: 4,
        target: [],
        color: '#4c8f4a',
        //color: ['#4c8f4a', '#aa4444'][state.yetis.length % 2],
        outlineColor: '#7dde7a',
        //outlineColor: ['#7dde7a', '#ff4444'][state.yetis.length % 2],
    })
}

window.addEventListener('load', () => {
    injectAdjustmentFields(document.getElementById('adjustments'), cfg)
    resize()
    setup(ctx)
    state.frameId = requestAnimationFrame(loop)
})
window.addEventListener('contextmenu', e => e.preventDefault())
window.addEventListener('resize', resize)

document.addEventListener('keydown', onKeyDown)

ctx.canvas.addEventListener('mousedown', onMouseDown)
ctx.canvas.addEventListener('mouseup', onMouseUp)
ctx.canvas.addEventListener('mousemove', onMouseMove)

function update() {
    state.yetis.forEach(yeti => {
        //yeti.vel = scale(yeti.vel, 1 - cfg.dragCoef)

        yeti.behaviors = []
        cfg.behaviors.forEach(b => {
            if (!b.opts.on) return
            yeti.behaviors.push({
                v: b._fn(yeti, state.yetis, b.opts),
                color: b.opts.color,
            })
        })

        yeti.vel = scale(yeti.vel, 1 - cfg.dragCoef)
        yeti.vel = add(yeti.vel, ...yeti.behaviors.map(b => b.v))

        const m = mag(yeti.vel)
        if (m > yeti.maxVel) {
            yeti.vel = scale(div(yeti.vel, m), yeti.maxVel)
        } else if (m < cfg.zeroThreshold) {
            yeti.vel = zero
        }

        if (yeti.vel.x !== 0 || yeti.vel.y !== 0) {
            yeti.heading = heading(yeti.vel)
        }
    })

    const delta = cfg.tickInterval * 0.001
    state.yetis.forEach(yeti => {
        yeti.pos = add(yeti.pos, scale(yeti.vel, delta))

        if (yeti.target.length && dist(yeti.target[0], yeti.pos) < yeti.radius * cfg.arrivalCoef) {
            yeti.target.splice(0, 1)
        }
    })
}

function loop(time) {
    while (!state.lastTick || time - state.lastTick >= cfg.tickInterval) {
        state.lastTick = (state.lastTick && state.lastTick + cfg.tickInterval) || time
        update()
    }

    const delta = (time - (state.lastTick || time)) * 0.001
    state.yetis.forEach(yeti => {
        yeti.dispPos = add(yeti.pos, scale(yeti.vel, delta))
    })

    draw(ctx, cfg, state)

    state.frameId = requestAnimationFrame(loop)
}

function issueMoveCommand(pos, append) {
    state.yetis.forEach(yeti => {
        if (!yeti.isSelected) return
        if (!append) yeti.target = []
        yeti.target.push(pos)
    })
}

function selectFromCorners(a, b) {
    state.yetis.forEach(yeti => {
        yeti.isSelected = circleRectIntersects(yeti, { a, b })
    })
}

function onKeyDown(e) {
    if (e.code === 'Space') {
        if (state.frameId) {
            cancelAnimationFrame(state.frameId)
            delete state.frameId
        } else {
            delete state.lastTick
            state.frameId = requestAnimationFrame(loop)
        }
    } else if (e.code === 'ArrowRight') {
        if (state.frameId) return

        update()
        state.yetis.forEach(yeti => {
            yeti.dispPos = yeti.pos
        })
        draw(ctx, cfg, state)
    }
}

function onMouseDown(e) {
    e.preventDefault()

    const pos = clientToWorld(vec(e.clientX, e.clientY))
    if (e.button === 0) {
        state.dragFrom = pos
        selectFromCorners(pos, pos)
    } else if (e.button === 2) {
        issueMoveCommand(pos, e.ctrlKey)
    }
}

function onMouseUp(e) {
    if (e.button === 0) {
        delete state.dragFrom
        delete state.dragTo
    }
}

function onMouseMove(e) {
    if (state.dragFrom) {
        state.dragTo = clientToWorld(vec(e.clientX, e.clientY))
        selectFromCorners(state.dragFrom, state.dragTo)
    }
}

function clientToWorld(pos) {
    return div(sub(pos, vec(ctx.canvas.width / 2, ctx.canvas.height / 2)), cfg.unitLength)
}

function resize() {
    ctx.canvas.width = window.innerWidth - 250
    ctx.canvas.height = window.innerHeight
}

function injectAdjustmentFields(parent, obj) {
    Object.keys(obj).forEach(key => {
        if (key.charAt(0) === '_') {
            const title = document.createElement('h4')
            title.innerText = obj[key].name
            parent.append(title)
            return
        }

        if (typeof obj[key] === 'object') {
            injectAdjustmentFields(parent, obj[key])
            return
        }

        const label = document.createElement('label')
        label.innerText = ` ${key}`

        const input = document.createElement('input')
        if (typeof obj[key] === 'number') {
            input.type = 'number'
            input.value = obj[key]
            input.addEventListener('input', e => {
                if (e.target.value === '') e.target.value = '0'
                obj[key] = parseFloat(e.target.value)
            })
        } else if (typeof obj[key] === 'boolean') {
            input.type = 'checkbox'
            if (obj[key]) input.checked = true
            input.addEventListener('change', () => {
                obj[key] = input.checked
            })
        } else if (typeof obj[key] === 'string') {
            input.type = 'color'
            input.value = obj[key]
            input.addEventListener('input', e => {
                obj[key] = e.target.value
            })
        }

        const divider = document.createElement('br')

        parent.append(input, label, divider)
    })
}
