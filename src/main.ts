import "./style.css";

const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const app_title = document.createElement("h1");
app_title.innerHTML = "Welcome to my canvas";
app.append(app_title);

const canvas = document.createElement("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.append(canvas);
const ctx = canvas.getContext('2d');
if(ctx){
    ctx.fillStyle = "white";
    ctx?.fillRect(0, 0, canvas.width, canvas.height);
}

const spacing_line = document.createElement("div");
app.append(spacing_line);

let isDrawing = false;
let currentLineWidth = 5;

class Line {
    points: { x: number; y: number }[] = [];
    lineWidth: number;

    constructor(x: number, y: number, lineWidth: number) {
        this.points.push({ x, y });
        this.lineWidth = lineWidth;
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length > 1) {
            ctx.beginPath();
            const { x, y } = this.points[0];
            ctx.moveTo(x, y);

            for (const point of this.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
        }
    }
}

const lines: Line[] = [];
const undoneLines: Line[] = [];
let currentLine: Line | null = null;

canvas.addEventListener("mousedown", (event) => {
    const cursor = { x: event.offsetX, y: event.offsetY };
    isDrawing = true;

    currentLine = new Line(cursor.x, cursor.y, currentLineWidth);
    lines.push(currentLine);
});

globalThis.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing && currentLine) {
        currentLine.drag(event.offsetX, event.offsetY);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

function drawLines() {
    if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const line of lines) {
            line.display(ctx);
        }
    }
}

const clearButton = document.createElement("button");
clearButton.innerText = "Clear Canvas";
app.append(clearButton);

clearButton.addEventListener("click", function () {
    if (ctx) {
        lines.length = 0;
        undoneLines.length = 0;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        drawLines();
    }
});

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", function () {
    if (lines.length > 0) {
        const poppedLine = lines.pop();
        if (poppedLine) {
            undoneLines.push(poppedLine);
        }
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", function () {
    if (undoneLines.length > 0) {
        const poppedLine = undoneLines.pop();
        if (poppedLine) {
            lines.push(poppedLine);
        }
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

const spacing_line2 = document.createElement("div");
app.append(spacing_line2);

const thinButton = document.createElement("button");
thinButton.innerText = "Thin";
app.append(thinButton);

thinButton.addEventListener("click", function () {
    currentLineWidth = 5;
    widthText.innerText = "Marker: Thin";
});

const thickButton = document.createElement("button");
thickButton.innerText = "Thick";
app.append(thickButton);

thickButton.addEventListener("click", function () {
    currentLineWidth = 10;
    widthText.innerText = "Marker: Thick";
});

const widthText = document.createElement("span");
widthText.innerText = "Marker: Thin";
widthText.style.fontSize = "15px";
widthText.style.fontWeight = "bold";
app.append(widthText);
