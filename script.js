const PI2 = Math.PI * 2
const random = (min, max) => Math.random() * (max - min + 1) + min | 0
const timestamp = _ => new Date().getTime()

// container
class Birthday {
    constructor() {
        this.resize()

        // create a lovely place to store the firework
        this.fireworks = []
        this.counter = 0

    }

    resize() {
        this.width = canvas.width = window.innerWidth
        const center = this.width / 2 | 0
        this.spawnA = center - center / 4 | 0
        this.spawnB = center + center / 4 | 0

        this.height = canvas.height = window.innerHeight
        this.spawnC = this.height * .1
        this.spawnD = this.height * .5

    }

    onClick(evt) {
        const x = evt.clientX || evt.touches && evt.touches[0].pageX
        const y = evt.clientY || evt.touches && evt.touches[0].pageY

        let count = random(3, 10)
        for (let i = 0; i < count; i++) this.fireworks.push(new Firework(
            random(this.spawnA, this.spawnB),
            this.height,
            x,
            y,
            random(0, 260),
            random(30, 110)))

        this.counter = -1

    }

    update(delta) {
        ctx.globalCompositeOperation = 'hard-light'
        ctx.fillStyle = `rgba(20,20,20,${7 * delta})`
        ctx.fillRect(0, 0, this.width, this.height)

        ctx.globalCompositeOperation = 'lighter'
        for (let firework of this.fireworks) firework.update(delta)

        // if enough time passed... create new new firework
        this.counter += delta * 3 // each second
        if (this.counter >= 1) {
            this.fireworks.push(new Firework(
                random(this.spawnA, this.spawnB),
                this.height,
                random(0, this.width),
                random(this.spawnC, this.spawnD),
                random(0, 360),
                random(30, 110)))
            this.counter = 0
        }

        // remove the dead fireworks
        if (this.fireworks.length > 1000) this.fireworks = this.fireworks.filter(firework => !firework.dead)

    }
}

class Firework {
    constructor(x, y, targetX, targetY, shade, offsprings) {
        this.dead = false
        this.offsprings = offsprings

        this.x = x
        this.y = y
        this.targetX = targetX
        this.targetY = targetY

        this.shade = shade
        this.history = []
    }
    update(delta) {
        if (this.dead) return

        const xDiff = this.targetX - this.x
        const yDiff = this.targetY - this.y
        if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) { // is still moving
            this.x += xDiff * 2 * delta
            this.y += yDiff * 2 * delta

            this.history.push({
                x: this.x,
                y: this.y
            })

            if (this.history.length > 20) this.history.shift()

        } else {
            if (this.offsprings && !this.madeChilds) {

                const babies = this.offsprings / 2
                for (let i = 0; i < babies; i++) {
                    const targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0
                    const targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0

                    birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0))

                }

            }
            this.madeChilds = true
            this.history.shift()
        }

        if (this.history.length === 0) this.dead = true
        else if (this.offsprings) {
            for (let i = 0; this.history.length > i; i++) {
                const point = this.history[i]
                ctx.beginPath()
                ctx.fillStyle = 'hsl(' + this.shade + ',100%,' + i + '%)'
                ctx.arc(point.x, point.y, 1, 0, PI2, false)
                ctx.fill()
            }
        } else {
            ctx.beginPath()
            ctx.fillStyle = 'hsl(' + this.shade + ',100%,50%)'
            ctx.arc(this.x, this.y, 1, 0, PI2, false)
            ctx.fill()
        }

    }
}

const textBlock = document.getElementById('counter')
const canvas = document.getElementById('birthday')
const body = document.getElementById('body')

const ctx = canvas.getContext('2d')
//01000001 01010011
let then = timestamp()

const birthday = new Birthday
window.onresize = () => birthday.resize()
document.onclick = evt => birthday.onClick(evt)
document.ontouchstart = evt => birthday.onClick(evt); (function loop() {
    requestAnimationFrame(loop)
    const now = timestamp()
    const delta = now - then
    then = now
    birthday.update(delta / 1000)
})()

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

function calculate() {
    const resultParagraph = document.getElementById('result');
    // 26Nov, Month is zero-based
    // 18:31, UTC+8
    const day2Date = new Date(2023, 10, 26, 18, 31);
    const timzone_HKT_offset_ms = (new Date().getTimezoneOffset() + 480) * 60 * 1000;
    const diff = timestamp() + timzone_HKT_offset_ms - day2Date.getTime()
    let msec = diff;
    const dd = Math.floor(msec / (1000 * 60 * 60 * 24));
    msec -= dd * 1000 * 60 * 60 * 24;
    const hh = Math.floor(msec / (1000 * 60 * 60));
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / (1000 * 60));
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    resultParagraph.innerHTML = '<span style="font-size:1.8em;">第</span><span style="font-size:2em;">' + dd + '</span><span style="font-size:1.8em;">日</span><br><span style="font-size:1.9em;">'
        + hh + '</span><span style="font-size:1.5em;">小時</span><span style="font-size:1.9em;">' + mm + '</span><span style="font-size:1.5em;">分</span><span style="font-size:1.9em;">'
        + ss + '</span><span style="font-size:1.5em;">秒</span>';

    showFirework(dd);
    setTimeout(calculate, 200);
}

function showFirework(dd) {
    if ((dd % 100 != 0 && dd % 365 != 0) || canvas == null) return;
    canvas.className = "canvas-after-firework";
    textBlock.className = "content-after-firework";
    body.className = "body-after-firework";
}

calculate();
