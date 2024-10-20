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

let isDrawing = false;

const lines: { x: number; y: number; }[][] = [];
let currentLine = null;
const cursor = {x: 0, y: 0};

canvas.addEventListener("mousedown", (event) => {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    isDrawing = true;

    currentLine = [];
    currentLine.push({x: cursor.x, y: cursor.y});
    lines.push(currentLine);
});

globalThis.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentLine.push({x: cursor.x, y: cursor.y});
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

function drawLine(){
    if (ctx) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const line of lines) {
            if (line.length > 1) {
                ctx.beginPath();
                const { x, y } = line[0];
                ctx.moveTo(x, y);
                for (const { x, y } of line) {
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
    }
}

const clearButton = document.createElement("button");
clearButton.innerText = "Clear Canvas";
app.append(clearButton);

clearButton.addEventListener("click", function() {
    if(ctx){
        lines.length = 0;
        ctx.fillStyle = "white";
        ctx?.fillRect(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawLine();
    }
});