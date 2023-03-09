export function setup(ctx) {
    ctx.canvas.style.background = '#24283b'
}

export function draw(ctx, cfg, state) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
    ctx.scale(cfg.unitLength, cfg.unitLength)

    drawGrid(ctx, cfg.behaviors[2].opts.boundary)

    state.yetis.forEach(yeti => {
        drawYeti(ctx, yeti, cfg.drawArrows)

        if (yeti.target.length && yeti.isSelected) {
            yeti.target.forEach(t => {
                drawTarget(ctx, t)
            })
        }
    })

    if (state.dragTo) {
        drawSelectionBox(ctx, cfg, state)
    }
}

function drawSelectionBox(ctx, cfg, state) {
    ctx.lineWidth = 2 / cfg.unitLength
    ctx.strokeStyle = '#ffffff'
    ctx.fillStyle = '#ffffff44'
    ctx.beginPath()
    ctx.rect(
        state.dragFrom.x,
        state.dragFrom.y,
        state.dragTo.x - state.dragFrom.x,
        state.dragTo.y - state.dragFrom.y
    )
    ctx.fill()
    ctx.stroke()
}

function drawTarget(ctx, t) {
    ctx.fillStyle = '#b9f27c'
    ctx.beginPath()
    ctx.arc(t.x, t.y, 0.1, 0, 2 * Math.PI)
    ctx.fill()
}

function drawYeti(ctx, yeti, drawArrows) {
    ctx.save()
    ctx.translate(yeti.dispPos.x, yeti.dispPos.y)
    ctx.rotate(yeti.heading || 0)

    if (yeti.isSelected) {
        drawSelectedCircle(ctx, yeti.radius)
    }

    ctx.lineWidth = 0.1
    ctx.strokeStyle = yeti.outlineColor
    ctx.fillStyle = yeti.color
    ctx.beginPath()
    ctx.moveTo(yeti.radius, 0)
    ctx.lineTo(-yeti.radius * 0.7, -yeti.radius * 0.8)
    ctx.lineTo(-yeti.radius * 0.7, yeti.radius * 0.8)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()

    if (drawArrows) {
        ctx.save()
        ctx.translate(yeti.dispPos.x, yeti.dispPos.y)

        drawArrow(ctx, yeti.vel, 0.05, '#ffffff')

        yeti.behaviors.forEach(b => {
            if (b.v.x === 0 && b.v.y === 0) return
            drawArrow(ctx, b.v, 0.05, b.color)
        })

        ctx.restore()
    }
}

function drawArrow(ctx, u, width, color) {
    const tipRatio = 0.05
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(u.x, u.y)
    ctx.moveTo(u.x * (1 - tipRatio) - u.y * tipRatio, u.y * (1 - tipRatio) + u.x * tipRatio)
    ctx.lineTo(u.x, u.y)
    ctx.moveTo(u.x * (1 - tipRatio) - u.y * -tipRatio, u.y * (1 - tipRatio) + u.x * -tipRatio)
    ctx.lineTo(u.x, u.y)
    ctx.stroke()
}

function drawSelectedCircle(ctx, r) {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 0.03
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, 2 * Math.PI)
    ctx.stroke()
}

function drawGrid(ctx, bounds) {
    ctx.fillStyle = '#42475e'
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
        for (let y = bounds.minY; y <= bounds.maxY; y++) {
            ctx.beginPath()
            ctx.arc(x, y, 0.05, 0, 2 * Math.PI)
            ctx.fill()
        }
    }
}
