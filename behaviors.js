import {
    add,
    circleConvexPolygonIntersects,
    dist,
    div,
    mag,
    perpCw,
    scale,
    sub,
    unit,
    vec,
    zero,
} from './util.js'

export function alignment(a, flock, opts) {
    let dir = vec(0, 0)
    let count = 0
    flock.forEach(b => {
        if (b === a) return
        if (!a.target) return
        if (dist(b.pos, a.pos) < opts.radius) {
            dir = add(dir, b.vel)
            count++
        }
    })
    if (count === 0) return zero
    return scale(div(dir, count), opts.weight)
}

export function avoid(a, flock, opts) {
    if (mag(a.vel) < 1) return zero
    const off = scale(unit(perpCw(a.vel)), a.radius)
    const p0 = add(a.pos, off)
    const p1 = add(p0, a.vel)
    const p2 = add(p1, scale(off, -2))
    const p3 = add(a.pos, scale(off, -1))
    let v
    flock
        .filter(b => b !== a)
        .forEach(b => {
            if (circleConvexPolygonIntersects(b, [p0, p1, p2, p3])) {
                v = scale(unit(perpCw(a.vel)), opts.weight)
            }
        })

    return v || zero
}

export function bound(a, _, opts) {
    let v = vec(0, 0)

    if (a.pos.x < opts.boundary.minX) v.x = 1
    else if (a.pos.x > opts.boundary.maxX) v.x = -1

    if (a.pos.y < opts.boundary.minY) v.y = 1
    else if (a.pos.y > opts.boundary.maxY) v.y = -1

    return scale(v, opts.weight)
}

export function cohesion(a, flock, opts) {
    let center = vec(0, 0)
    let count = 0
    flock.forEach(b => {
        if (b === a) return
        if (!a.target.length) return
        if (dist(b.pos, a.pos) < opts.radius) {
            center = add(center, b.pos)
            count++
        }
    })
    if (count === 0) return zero
    return scale(sub(div(center, count), a.pos), opts.weight)
}

export function seek(a, _, opts) {
    if (!a.target.length) return zero

    const slowingDistance = a.radius

    let desiredVel = sub(a.target[0], a.pos)

    const distance = mag(desiredVel)
    if (distance < slowingDistance) {
        desiredVel = scale(unit(desiredVel), a.maxVel * (distance / slowingDistance))
    } else {
        desiredVel = scale(unit(desiredVel), a.maxVel)
    }

    //return scale(sub(desiredVel, a.vel), opts.weight)
    return scale(desiredVel, opts.weight)
}

export function separation(a, flock, opts) {
    let totalForce = vec(0, 0)
    let count = 0
    flock.forEach(b => {
        if (b === a) return
        //if (a.target.length) return

        const d = dist(a.pos, b.pos)

        if (d < a.radius + b.radius) {
            const pushForce = unit(sub(a.pos, b.pos))
            totalForce = add(totalForce, scale(pushForce, (a.radius + b.radius) / d))
            //totalForce = add(totalForce, pushForce)
            count++
        }
    })

    if (count === 0) return zero
    totalForce = div(totalForce, count)
    return scale(totalForce, opts.weight)
}
