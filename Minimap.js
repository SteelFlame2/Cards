var alpha = 0.6;
class Minimap {
    constructor(Position, Size, Cards, Lines) {
        this.cards = Cards;
        this.lines = Lines;
        
        this.position = Position;
        this.size = Size;
        this.canv = this.GenerateCanvas();
        this.ctx = this.canv.getContext('2d');

        this.hoveredLinedData = [];
        this.isMouseOverLine = false;
        this.canv.addEventListener("mousemove",(e)=>{
            this.isMouseOverLine = false;
            let pointedLine = -1;
            let pointedCard = -1;
            for (let i = 0; i < Lines.length; i++) {
                let p = this.MinimapPositionToGlobal([e.layerX,e.layerY]);
                if (this.lines[i].isHovered(p[0],p[1],40)) {
                    pointedLine=i;
                }
            }
            for (let i = 0; i < Cards.length; i++) {
                let p = this.MinimapPositionToGlobal([e.layerX,e.layerY]);
                if (this.cards[i].isPointOnCard(p[0],p[1])) {
                    pointedCard=i;
                }
            }
            if (pointedLine > -1) {
                this.hoveredLinedData = [this.lines[pointedLine].card1.GetHeader(),e.layerX,e.layerY];
                this.isMouseOverLine = true;
            }
            if (pointedCard > -1) {
                this.hoveredLinedData = [this.cards[pointedCard].GetHeader(),e.layerX,e.layerY];
                this.isMouseOverLine = true;
            }
            needMinimapRedraw = true;
        });
        this.canv.addEventListener("mousedown", (e)=>{
            let pos = this.MinimapPositionToGlobal([e.layerX,e.layerY]);
            window.scrollTo(pos[0]-window.innerWidth/2, pos[1]-window.innerHeight/2);
            needLineRedraw = true;
            needMinimapRedraw = true;
        });
        
        this.isBoundsChanged = true;
        onSomeCardMoved.push(() => {
            this.isBoundsChanged = true;
            needMinimapRedraw = true;
        });
        
        onCardsLoadedFuncs.push(()=>{
            this.isBoundsChanged = true;
            this.bounds = this.GetCardsBounds();
            needMinimapRedraw = true;
        });
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
        if (this.isBoundsChanged) {
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
            this.bounds = [min,max];
            this.isBoundsChanged = false;
            return [min,max];
        } else {
            return this.bounds;
        }
    }
    GlobalPositionToMinimap(pos) {
        let bounds = this.GetCardsBounds();
        return [pos[0]/(bounds[1][0]+200)*this.size[0],pos[1]/(bounds[1][1]+200)*this.size[1]];
    }
    GlobalRectToPosition(Rect) {
        let pos = this.GlobalPositionToMinimap(Rect[0]);
        let size = this.GlobalPositionToMinimap([Rect[0][0]+Rect[1][0],Rect[0][1]+Rect[1][1]]);
        size = [size[0]-pos[0],size[1]-pos[1]];
        return [pos,size];
    } 
    MinimapPositionToGlobal(pos) {
        let bounds = this.GetCardsBounds();

        return [pos[0]/this.size[0]*(bounds[1][0]+200),pos[1]/this.size[1]*(bounds[1][1]+200)];
    }
    IsPointOnLine(mousePos) {
        let ind = -1;
        for (let i = 0; i < this.lines.length; i++) {
            let p = this.MinimapPositionToGlobal(mousePos);
            if (this.lines[i].isHovered(p[0],p[1],40)) {
                ind=i;
            }
        }
        return ind;
    }
    DrawLines() {
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.lines.length; i++) {
            this.ctx.strokeStyle = this.lines[i].card1.color;
            this.ctx.beginPath();
            let rect1 = this.GlobalRectToPosition(this.lines[i].card1.GetCardRect());
            let rect2 = this.GlobalRectToPosition(this.lines[i].card2.GetCardRect());
            
            this.ctx.moveTo(rect1[0][0]+rect1[1][0]/2,rect1[0][1]+rect1[1][1]/2);
            this.ctx.lineTo(rect2[0][0]+rect2[1][0]/2,rect2[0][1]+rect2[1][1]/2);

            this.ctx.stroke();
        }
    }
    DrawTargets() {
        for (let i = 0; i < this.cards.length; i++) {
            let targetRect = this.GlobalRectToPosition(this.cards[i].GetCardRect());

            this.ctx.fillStyle = this.cards[i].color;
            this.ctx.fillRect(targetRect[0][0],targetRect[0][1],targetRect[1][0],targetRect[1][1]);
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

        if (this.isMouseOverLine) {
            this.ctx.fillStyle = "White";
            this.ctx.font = "16px Arial";
            this.ctx.fillText(this.hoveredLinedData[0],this.hoveredLinedData[1],this.hoveredLinedData[2]);
        }
    }
    Draw() {
        this.ctx.clearRect(0,0,this.canv.width,this.canv.height);

        this.DrawPrimaryUI();
        this.DrawLines();
        this.DrawTargets();
        this.DrawDynamicUI();
    }
}

var miniMapSize = 100/window.devicePixelRatio;
var miniMap = new Minimap([canv.width-miniMapSize-5,5],[miniMapSize,miniMapSize], Cards, Lines);
window.addEventListener("resize",(e) => {
    miniMapSize = 100/window.devicePixelRatio;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);
    needMinimapRedraw = true;
});

miniMap.canv.addEventListener("mouseenter", (e) => {
    miniMapSize = 400/window.devicePixelRatio;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);

    alpha = 1;
    needMinimapRedraw = true;
});
miniMap.canv.addEventListener("mouseleave", (e) => {
    miniMapSize = 100/window.devicePixelRatio;
    miniMap.SetSize([miniMapSize,miniMapSize]);
    miniMap.SetPosition([window.innerWidth-miniMapSize-5,5]);

    alpha = 0.6;
    needMinimapRedraw = true;
});

function updateMinimap() {
    if (needMinimapRedraw) {
        miniMap.Draw();
        needMinimapRedraw = false;
    }
    requestAnimationFrame(updateMinimap);
}
requestAnimationFrame(updateMinimap);

window.addEventListener("load", (e) =>{ 
    needMinimapRedraw = true;

});