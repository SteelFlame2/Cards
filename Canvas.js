let bgCanv = document.getElementById("background-canvas");
let bg = bgCanv.getContext("webgl");

canv.width = window.innerWidth;
canv.height = window.innerHeight;

bgCanv.width = window.innerWidth;
bgCanv.height = window.innerHeight;
window.onresize = function (e) {
    bgCanv.width = window.innerWidth;
    bgCanv.height = window.innerHeight;

    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
}

let haveBackgroundNoise = false;
let isBackgroundTurned = false;

function initShaders(gl, vs_source, fs_source) {
    // Compile shaders
    var vertexShader = makeShader(gl, vs_source, gl.VERTEX_SHADER);
    var fragmentShader = makeShader(gl, fs_source, gl.FRAGMENT_SHADER);

    // Create program
    var glProgram = gl.createProgram();

    // Attach and link shaders to the program
    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);
    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program");
        return false;
    }

    // Use program
    gl.useProgram(glProgram);
    gl.program = glProgram;

    return true;
}
function initVertexBuffers(gl) {
    // Vertices
    var dim = 2;
    var vertices = new Float32Array([
        -1, 1, 1, 1, 1, -1, // Triangle 1
        -1, 1, 1, -1, -1, -1 // Triangle 2 
    ]);

    // Fragment color

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, dim, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var cardsCount = gl.getUniformLocation(gl.program, 'cardsCount');
    gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Resolution'), [canv.width, canv.height]);
    gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Offset'), [window.scrollX, -window.scrollY]);
    gl.uniform1fv(gl.getUniformLocation(gl.program, 'u_Scale'), [window.devicePixelRatio]);
    gl.uniform1i(cardsCount, Cards.length);
    gl.uniform1i(gl.getUniformLocation(gl.program, 'doesHaveNoise'), haveBackgroundNoise);

    var XArray = [];
    var YArray = [];
    var indices = [];

    for (let i = 0; i < Cards.length; i++) {
        XArray.push(Number(Cards[i].cardDOM.style.left.slice(0, -2)) - window.scrollX + Cards[i].cardDOM.clientWidth / 2);
        YArray.push((canv.height - (Cards[i].cardDOM.clientHeight / 2 + Number(Cards[i].cardDOM.style.top.slice(0, -2)) - window.scrollY)));

        indices.push(i);
    }
    let Groups = DivideInGroups(transformToTree(reformatLines()));
    for (let i = 0; i < Groups.length; i++) {
        for (let j = 0; j < Groups[i].length; j++) {
            indices[Groups[i][j].obj.id] = i;
        }
    }

    gl.uniform1fv(gl.getUniformLocation(gl.program, 'cardsPositionsX'), new Float32Array(XArray));
    gl.uniform1fv(gl.getUniformLocation(gl.program, 'cardsPositionsY'), new Float32Array(YArray));
    gl.uniform1iv(gl.getUniformLocation(gl.program, 'indices'), new Int32Array(indices));

    return vertices.length / dim;
}
function makeShader(gl, src, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
        return;
    }
    return shader;
}

function randomIn(min, max) {
    return (min + Math.random() * (max - min));
}
function randStr(min, max) {
    let v = randomIn(min[0], max[0]);
    return (v * randomIn(0.9, 1.1)).toFixed(3) + "," + (v * randomIn(0.9, 1.1)).toFixed(3) + "," + (v * randomIn(0.9, 1.1)).toFixed(3);
}
function getColors(count, min, max) {
    let str = `if (minI == 0) {
        gl_FragColor = vec4(${randStr(min, max)},1.);
    }`;

    for (let i = 1; i < count; i++) {
        str += `
            else if (minI == ${i}) {
                gl_FragColor = vec4(${randStr(min, max)},1.);
            }`;
    }
    return str;
}

let passedTime;

function backUpdate() {
    return;
}
/*initShaders(bg, document.getElementById('shaderVs').text, document.getElementById('shaderFs').text);
bg.clearColor(0, 0, 0, 1);
function backUpdate() {
    let startTime = new Date();
    if (!isBackgroundTurned) return;
    bg.viewport(0, 0, bgCanv.width, bgCanv.height);

    initVertexBuffers(bg);

    bg.clear(bg.COLOR_BUFFER_BIT | bg.DEPTH_BUFFER_BIT);
    bg.drawArrays(bg.TRIANGLES, 0, 6);
    bg.finish()
    passedTime = new Date() - startTime;
}
backUpdate();*/