var alpha = 0.6;
class Minimap {
    constructor(Position, Size, Cards, Lines) {
        this.cards = Cards;
        this.lines = Lines;
        
        this.position = Position;
        this.size = Size;
        this.canv = this.GenerateCanvas();
        this.ctx = this.canv.getContext('2d');
    }
    SetPosition(pos) {
        this.canv.style.left = pos[0]+"px";
        this.canv.style.top = pos[1]+"px";
    }
    SetSize(size) {
        this.size = size;
        this.canv.width = size[0];
        this.canv.height = size[1];
    }
    GenerateCanvas() {
        let canv = document.createElement('canvas');
        canv.id = "minimap-canvas";

        document.body.appendChild(canv);

        canv.style.zIndex = "10";
        canv.style.position = "fixed";
        // canv.style.pointerEvents = "none";
        canv.style.resize = "none";
        canv.style.overflow = "auto";
        
        canv.style.left = this.position[0]+"px";
        canv.style.top = this.position[1]+"px";
        canv.width = this.size[0];
        canv.height = this.size[1];

        return canv;
    }
    GetCardsBounds() {
        let min = [Infinity,Infinity];
        let max = [-Infinity,-Infinity];

        for (let i = 0; i < this.cards.length; i++) {
            let pos = this.cards[i].GetCardRect()[0];
            if (min[0] > pos[0]) {
                min[0] = pos[0];
            }
            if (max[0] < pos[0]) {
                max[0] = pos[0];
            }
            if (min[1] > pos[1]) {
                min[1] = pos[1];
            }
            if (max[1] < pos[1]) {
                max[1] = pos[1];
            }
        }
        return [min,max];
    }
    GlobalPositionToMinimap(pos) {
        let bounds = this.GetCardsBounds();
        bounds[1][0] += 200;
        bounds[1][1] += 200;
        return [pos[0]/bounds[1][0]*this.size[0],pos[1]/bounds[1][1]*this.size[1]];
    }
    DrawLines() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = inRgba(1,1,1,alpha);
        this.ctx.beginPath();
        for (let i = 0; i < this.lines.length; i++) {
            let pos1 = this.GlobalPositionToMinimap(this.lines[i].card1.GetCardRect()[0]);
            let pos2 = this.GlobalPositionToMinimap(this.lines[i].card2.GetCardRect()[0]);
            
            this.ctx.moveTo(pos1[0],pos1[1]);
            this.ctx.lineTo(pos2[0],pos2[1]);

        }
        this.ctx.stroke();
    }
    DrawTargets() {
        for (let i = 0; i < this.cards.length; i++) {
            let targetPosition = this.GlobalPositionToMinimap(this.cards[i].GetCardRect()[0]);

            this.ctx.fillStyle = inRgba(0,1,0,alpha);
            this.ctx.fillRect(targetPosition[0],targetPosition[1],1,1);
        }
    }
    DrawPrimaryUI() {
        this.ctx.fillStyle = inRgba(0,0,0,alpha);
        this.ctx.fillRect(0,0,this.size[0],this.size[1]);

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = inRgba(0.2,0,0,alpha);
        this.ctx.strokeRect(0,0,this.size[0]-1,this.size[1]-1);
    }
    DrawDynamicUI() {
        let viewPosMin = this.GlobalPositionToMinimap([window.scrollX,window.scrollY]);
        let viewPosMax = this.GlobalPositionToMinimap([window.scrollX+window.innerWidth,window.scrollY+window.innerHeight]);

        this.ctx.strokeStyle = inRgba(1,1,1,alpha);
        this.ctx.strokeRect(viewPosMin[0],viewPosMin[1],viewPosMax[0]-viewPosMin[0],viewPosMax[1]-viewPosMin[1]);
    }
    Draw() {
        this.ctx.clearRect(0,0,this.canv.width,this.canv.height);

        this.DrawPrimaryUI();
        this.DrawLines();
        this.DrawTargets();
        this.DrawDynamicUI();
    }
}

var miniMapSize = 100;
var miniMap = new Minimap([canv.width-miniMapSize-5,5],[miniMapSize,miniMapSize], Cards, Lines);
window.addEventListener("resize",(e) => {
    // miniMapSize = 200;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);
});

miniMap.canv.addEventListener("mouseenter", (e) => {
    miniMapSize = 400;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);

    alpha = 1;
});
miniMap.canv.addEventListener("mouseleave", (e) => {
    miniMapSize = 100;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);

    alpha = 0.6;
});

function updateMinimap() {

    miniMap.Draw();
    requestAnimationFrame(updateMinimap);
}
requestAnimationFrame(updateMinimap);