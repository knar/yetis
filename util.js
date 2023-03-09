export function vec(x, y) {
    return ({ x, y })
}
export const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
export const sub = (u, v) => vec(u.x - v.x, u.y - v.y)
export const scale = (u, a) => vec(u.x * a, u.y * a)
export const div = (u, a) => vec(u.x / a, u.y / a)
export const dot = (u, v) => u.x * v.x + u.y * v.y
export const mag2 = ({ x, y }) => x * x + y * y
export const mag = u => Math.sqrt(mag2(u))
export const dist = (u, v) => Math.sqrt(mag2(sub(u, v)))
export const heading = ({ x, y }) => Math.atan2(y, x)
export const unit = u => div(u, mag(u))
export const cross = (u, v) => u.x * v.y - u.y * v.x

export function zero() {
    return { x: 0, y: 0 }
}

export function proj(a, b) {
    const unitB = unit(b)
    return scale(unitB, dot(a, unitB))
}

export function perpCw({ x, y }){
    return vec(-y, x)
}

export function perpCcw({ x, y }) {
    return vec(y, -x)
}

export function rand(min, max) {
    return min + Math.random() * (max - min)
}

export function randInt(min, max){
    return min + Math.floor(Math.random() * (max - min))
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

export function circleRectIntersects(circle, rect) {
    const minX = Math.min(rect.a.x, rect.b.x)
    const maxX = Math.max(rect.a.x, rect.b.x)
    const minY = Math.min(rect.a.y, rect.b.y)
    const maxY = Math.max(rect.a.y, rect.b.y)
    const closest = vec(clamp(circle.pos.x, minX, maxX), clamp(circle.pos.y, minY, maxY))
    const distanceSquared = mag2(sub(circle.pos, closest))
    return distanceSquared <= circle.radius * circle.radius
}

export function circleConvexPolygonIntersects(circle, poly) {
    if (pointWithinConvexPolygon(circle.pos, poly)) {
        return true
    }

    // circle center within radius of an edge check
    for (let i = 0; i < poly.length; i++) {
        if (pointLineDist(circle.pos, [poly[i], poly[(i + 1) % poly.length]]) < circle.radius) {
            return true
        }
    }

    return false
}

export function pointLineDist(pt, line) {
    const u = sub(pt, line[0])
    const v = sub(line[1], line[0])
    const w = add(line[0], proj(u, v))

    const x =
        line[0].x < line[1].x ? clamp(w.x, line[0].x, line[1].x) : clamp(w.x, line[1].x, line[0].x)
    const y =
        line[0].y < line[1].y ? clamp(w.y, line[0].y, line[1].y) : clamp(w.y, line[1].y, line[0].y)

    const d = dist(vec(x, y), pt)
    return d
}

export function pointWithinConvexPolygon(pt, poly) {
    const v = sub(poly[0], poly[poly.length - 1])
    const p = sub(pt, poly[poly.length - 1])
    let side = cross(v, p) > 0
    for (let i = 1; i < poly.length; i++) {
        const v = sub(poly[i], poly[i - 1])
        const p = sub(pt, poly[i - 1])
        if (side != cross(v, p) > 0) {
            return false
        }
    }

    return true
}
