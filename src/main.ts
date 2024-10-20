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
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (event) => {
    x = event.offsetX;
    y = event.offsetY;
    isDrawing = true;
});

globalThis.addEventListener("mouseup", (event) => {
    if (isDrawing){
        drawLine(ctx, x, y, event.offsetX, event.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        drawLine(ctx, x, y, event.offsetX, event.offsetY);
        x = event.offsetX;
        y = event.offsetY;
    }
});

function drawLine(context: CanvasRenderingContext2D | null, x1: number, y1: number, x2: number, y2: number){
    context?.beginPath();
    if (context) {
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context?.moveTo(x1, y1);
        context?.lineTo(x2, y2);
        context?.stroke();
        context?.closePath();
    }
}

const clearButton = document.createElement("button");
clearButton.innerText = "Clear Canvas";
app.append(clearButton);

clearButton.addEventListener("click", function() {
    if(ctx){
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx?.fillRect(0, 0, canvas.width, canvas.height);
    }
});