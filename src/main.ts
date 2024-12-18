import "./style.css";

const APP_NAME = "Canvas Application";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const app_title = document.createElement("h1");
app_title.innerHTML = "Canvas App v1.0";
app.append(app_title);

// Creation of canvas
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

const spacing_line = document.createElement("h1");
app.append(spacing_line);

// Text for pen description
const widthText = document.createElement("span");
widthText.innerText = "Pen: Thin";
widthText.style.fontSize = "15px";
widthText.style.fontWeight = "bold";
app.append(widthText);

const spacing_line2 = document.createElement("div");
app.append(spacing_line2);

let isDrawing = false;
let currentLineWidth = 5;
let currentMousePos = { x: 0, y: 0 };
let stickerMode = false;
let stickerEmoji = "";
let toolHue = 0;
let stickerRotation = 0;

// Creation of slider
const hueSlider = document.createElement("input");
hueSlider.type = "range";
hueSlider.min = "0";
hueSlider.max = "360";
hueSlider.value = "0";
hueSlider.style.width = "100%";
app.append(hueSlider);
const hueLabel = document.createElement("span");
hueLabel.innerText = "Color Hue: Red / Sticker Rotation: 0°";
app.append(hueLabel);

const spacing_line3 = document.createElement("div");
app.append(spacing_line3);

// Slider detection
hueSlider.addEventListener("input", (event) => {
    const value = parseInt((event.target as HTMLInputElement).value);
    const color_name = getColorNameFromHue(value)
    hueLabel.innerText = `Color Hue: ${color_name} / Sticker Rotation: ${value}°`;

    // Slider output changes based on if user is in stickerMode
    if (stickerMode) {
        stickerRotation = value;
    } else {
        if (ctx) {
            toolHue = value;
            ctx.strokeStyle = `hsl(${toolHue}, 100%, 50%)`;
        }
    }
});

class Line {
    points: { x: number; y: number }[] = []; // Each line is an array of points
    lineWidth: number;
    hue: number;

    constructor(x: number, y: number, lineWidth: number, hue: number) {
        this.points.push({ x, y });
        this.lineWidth = lineWidth;
        this.hue = hue;
    }

    // Moving mouse adds points to the line
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // Output the lines to the canvas
    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length > 1) {
            ctx.beginPath();
            const { x, y } = this.points[0];
            ctx.moveTo(x, y);

            for (const point of this.points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.stroke();
        }
    }
}

class Sticker {
    emoji: string;
    position: { x: number; y: number };
    rotation: number;

    constructor(emoji: string, x: number, y: number, rotation: number) {
        this.emoji = emoji;
        this.position = { x, y };
        this.rotation = rotation;
    }

    drag(x: number, y: number) {
        this.position = { x, y };
    }

    // Outputs the stickers to the canvas
    display(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.font = "30px serif";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

const elements: (Line | Sticker)[] = [];
const undoneElements: (Line | Sticker)[] = [];
let currentElement: Line | Sticker | null = null;

canvas.addEventListener("mousedown", (event) => {
    const cursor = { x: event.offsetX, y: event.offsetY };

    //code for sticker placement
    if (stickerMode && stickerEmoji) {
        currentElement = new Sticker(stickerEmoji, cursor.x, cursor.y, stickerRotation);
        elements.push(currentElement);
        currentElement = null;
        stickerMode = false;

        //reset to thin Pen
        currentLineWidth = 5;
        widthText.innerText = "Pen: Thin";
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } 
    //code for line placement
    else {
        isDrawing = true;
        currentElement = new Line(cursor.x, cursor.y, currentLineWidth, toolHue);
        elements.push(currentElement);
    }
});

// Mouse up updates the canvas and turns off draw mode
globalThis.addEventListener("mouseup", () => {
    isDrawing = false;
    currentElement = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

// Mouse move will add points to a line if the mouse is down and user has line selected
canvas.addEventListener("mousemove", (event) => {
    const cursor = { x: event.offsetX, y: event.offsetY };
    currentMousePos = cursor;

    if (isDrawing && currentElement instanceof Line) {
        currentElement.drag(cursor.x, cursor.y);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }

    stickerRotation = Number(hueSlider.value);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

// Adds lines and stickers to the canvas
function drawElements(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const element of elements) {
        element.display(ctx);
    }
}

// Creation of clear canvas button
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

// Anytime the drawing changes, the canvas is redrawn
canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        drawElements(ctx);
    }
});

// Creation of the undo button
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

// Creation of the redo button
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


const spacing_line4 = document.createElement("div");
app.append(spacing_line4);

// Creation of the thin pen button
const thinButton = document.createElement("button");
thinButton.innerText = "Thin Pen";
app.append(thinButton);
thinButton.addEventListener("click", function () {
    currentLineWidth = 5;
    widthText.innerText = "Pen: Thin";
    stickerEmoji = "";
    stickerMode = false;
});

// Creation of the thick pen button
const thickButton = document.createElement("button");
thickButton.innerText = "Thick Pen";
app.append(thickButton);
thickButton.addEventListener("click", function () {
    currentLineWidth = 10;
    widthText.innerText = "Pen: Thick";
    stickerEmoji = "";
    stickerMode = false;
});

// Covers what happens when user moves their mouse based on the tool they have selected (line or sticker)
canvas.addEventListener("tool-moved", () => {
    if (ctx && !isDrawing) {
        drawElements(ctx);
        if (stickerMode) {
            ctx.save();
            ctx.translate(currentMousePos.x, currentMousePos.y);
            ctx.rotate((stickerRotation * Math.PI) / 180);
            ctx.font = "30px serif";
            ctx.fillText(stickerEmoji, 0, 0);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(currentMousePos.x, currentMousePos.y, currentLineWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${toolHue}, 100%, 50%)`;
            ctx.fill();
            canvas.style.cursor = "none";
        }
    }
});

const stickerOptions = ["😭", "🫡", "🍡"];
const addStickerButton = document.createElement("button");

//create all the buttons for premade and custom stickers
function createStickerButtons() {
    stickerButtonsContainer.innerHTML = "";
    stickerOptions.forEach((sticker) => {
        const stickerButton = document.createElement("button");
        stickerButton.innerText = sticker;
        stickerButton.addEventListener("click", () => {
            widthText.innerText = `Sticker: ${sticker}`;
            stickerEmoji = sticker;
            stickerMode = true;
        });
        stickerButtonsContainer.append(stickerButton);
    });
}

const stickerButtonsContainer = document.createElement("div");
app.append(stickerButtonsContainer);
createStickerButtons();

// Creation of the custom sticker button
addStickerButton.innerText = "Add Custom Sticker";
app.append(addStickerButton);
addStickerButton.addEventListener("click", () => {
    const input = prompt("Enter custom sticker text", "❓");
    if (input) {
        stickerEmoji = input;
        stickerMode = true;
        stickerOptions.push(input);
        createStickerButtons();
    }
});

// Creation of the export canvas button
const exportButton = document.createElement("button");
exportButton.innerText = "Export as PNG";
app.append(exportButton);
exportButton.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas") as HTMLCanvasElement;
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d");

    if (exportCtx) {
        exportCtx.scale(4, 4); // Scale up by 4x
        drawElements(exportCtx); // Draw elements on the larger canvas

        exportCanvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "canvas_export.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }, "image/png");
    }
});


// Outputs a color's name based on the hue value
function getColorNameFromHue(hue: number): string {
    if (hue >= 0 && hue < 30) return "Red";
    if (hue >= 30 && hue < 60) return "Orange";
    if (hue >= 60 && hue < 90) return "Yellow";
    if (hue >= 90 && hue < 150) return "Green";
    if (hue >= 150 && hue < 210) return "Cyan";
    if (hue >= 210 && hue < 270) return "Blue";
    if (hue >= 270 && hue < 300) return "Purple";
    if (hue >= 300 && hue < 330) return "Pink;"
    return "Red"; // Covers hue values from 330 to 360
}