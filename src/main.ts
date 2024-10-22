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
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const spacing_line = document.createElement("div");
app.append(spacing_line);

let isDrawing = false;
let currentLineWidth = 5;
let currentMousePos = { x: 0, y: 0 };
let stickerMode = false;
let stickerEmoji = "";

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

class Sticker {
    emoji: string;
    position: { x: number; y: number };

    constructor(emoji: string, x: number, y: number) {
        this.emoji = emoji;
        this.position = { x, y };
    }

    drag(x: number, y: number) {
        this.position = { x, y };
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "30px serif";
        ctx.fillText(this.emoji, this.position.x, this.position.y);
    }
}

const elements: (Line | Sticker)[] = [];
const undoneElements: (Line | Sticker)[] = [];
let currentElement: Line | Sticker | null = null;

canvas.addEventListener("mousedown", (event) => {
    const cursor = { x: event.offsetX, y: event.offsetY };

    //code for sticker placement
    if (stickerMode && stickerEmoji) {
        currentElement = new Sticker(stickerEmoji, cursor.x, cursor.y);
        elements.push(currentElement);
        currentElement = null;
        stickerMode = false;

        //reset to thin marker
        currentLineWidth = 5;
        widthText.innerText = "Marker: Thin";
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } 
    //code for line placement
    else {
        isDrawing = true;
        currentElement = new Line(cursor.x, cursor.y, currentLineWidth);
        elements.push(currentElement);
    }
});

globalThis.addEventListener("mouseup", () => {
    isDrawing = false;
    currentElement = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mousemove", (event) => {
    const cursor = { x: event.offsetX, y: event.offsetY };
    currentMousePos = cursor;

    if (isDrawing && currentElement instanceof Line) {
        currentElement.drag(cursor.x, cursor.y);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }

    canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

function drawElements() {
    if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const element of elements) {
            element.display(ctx);
        }
    }
}

const clearButton = document.createElement("button");
clearButton.innerText = "Clear Canvas";
app.append(clearButton);

clearButton.addEventListener("click", function () {
    if (ctx) {
        elements.length = 0;
        undoneElements.length = 0;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        drawElements();
    }
});

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", function () {
    if (elements.length > 0) {
        const poppedElement = elements.pop();
        if (poppedElement) {
            undoneElements.push(poppedElement);
        }
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", function () {
    if (undoneElements.length > 0) {
        const poppedElement = undoneElements.pop();
        if (poppedElement) {
            elements.push(poppedElement);
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
    stickerEmoji = "";
    stickerMode = false;
});

const thickButton = document.createElement("button");
thickButton.innerText = "Thick";
app.append(thickButton);

thickButton.addEventListener("click", function () {
    currentLineWidth = 10;
    widthText.innerText = "Marker: Thick";
    stickerEmoji = "";
    stickerMode = false;
});

const widthText = document.createElement("span");
widthText.innerText = "Marker: Thin";
widthText.style.fontSize = "15px";
widthText.style.fontWeight = "bold";
app.append(widthText);

canvas.addEventListener("tool-moved", () => {
    if (ctx && !isDrawing) {
        drawElements();
        if (stickerMode) {
            ctx.font = "30px serif";
            ctx.fillText(stickerEmoji, currentMousePos.x, currentMousePos.y);
        } else {
            ctx.beginPath();
            ctx.arc(currentMousePos.x, currentMousePos.y, currentLineWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            canvas.style.cursor = "none";
        }
    }
});

const spacing_line3 = document.createElement("div");
app.append(spacing_line3);

const sobButton = document.createElement("button");
sobButton.innerText = "😭";
app.append(sobButton);

sobButton.addEventListener("click", function () {
    widthText.innerText = "Marker: 😭";
    stickerEmoji = "😭";
    stickerMode = true;
});

const saluteButton = document.createElement("button");
saluteButton.innerText = "🫡";
app.append(saluteButton);

saluteButton.addEventListener("click", function () {
    widthText.innerText = "Marker: 🫡";
    stickerEmoji = "🫡";
    stickerMode = true;
});

const dangoButton = document.createElement("button");
dangoButton.innerText = "🍡";
app.append(dangoButton);

dangoButton.addEventListener("click", function () {
    widthText.innerText = "Marker: 🍡";
    stickerEmoji = "🍡";
    stickerMode = true;
});
