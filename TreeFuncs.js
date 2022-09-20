class Connection {
    constructor(obj, line, treeElem) {
        this.obj = obj;
        this.line = line;
        this.treeElem = treeElem;
    }
}
class TreeElem {
    constructor(obj, connections = []) {
        this.obj = obj;
        this.connections = connections;
    }
}
function reformatLines() {
    let _Lines = [];
    for (let i = 0; i < Lines.length; i++) {
        _Lines.push({ p1: Lines[i].card1, p2: Lines[i].card2 });
    }
    return _Lines;
}
function findObjectAsTreeElem(ObjToFind, TreeElems) {
    for (let i = 0; i < TreeElems.length; i++) {
        if (TreeElems[i].obj == ObjToFind) {
            return TreeElems[i];
        }
    }
    return undefined;
}
function transformToTree(Connections) {
    let Objects = [];
    for (let i = 0; i < Connections.length; i++) {
        if ((typeof findObjectAsTreeElem(Connections[i].p1, Objects)) == "undefined") {
            Objects.push(new TreeElem(Connections[i].p1, []));
        }
        if ((typeof findObjectAsTreeElem(Connections[i].p2, Objects)) == "undefined") {
            Objects.push(new TreeElem(Connections[i].p2, []));
        }
    }
    for (let i = 0; i < Objects.length; i++) {
        for (let j = 0; j < Connections.length; j++) {
            if (Connections[j].p1 == Objects[i].obj) {
                Objects[i].connections.push(new Connection(Connections[j].p2, Connections[j], findObjectAsTreeElem(Connections[j].p2, Objects)));
            }
            if (Connections[j].p2 == Objects[i].obj) {
                Objects[i].connections.push(new Connection(Connections[j].p1, Connections[j], findObjectAsTreeElem(Connections[j].p1, Objects)));
            }
        }
    }
    return Objects;
}
function DivideInGroups(TreeToDivide) {
    if (TreeToDivide.length == 0) return [];
    let ObjectsInGroups = [];
    let ObjectsToGroup = [TreeToDivide[0]];
    let Groups = [];

    let lastPoint = 0;

    let gInd = 0;
    while (true) {
        let newObjectsToGroup = [];
        for (let i = 0; i < ObjectsToGroup.length; i++) {
            for (let j = 0; j < ObjectsToGroup[i].connections.length; j++) {
                if (!ObjectsInGroups.includes(ObjectsToGroup[i].connections[j].treeElem) &&
                    !ObjectsToGroup.includes(ObjectsToGroup[i].connections[j].treeElem) &&
                    !newObjectsToGroup.includes(ObjectsToGroup[i].connections[j].treeElem))
                    newObjectsToGroup.push(ObjectsToGroup[i].connections[j].treeElem);
            }
            ObjectsInGroups.push(ObjectsToGroup[i]);
        }
        if (newObjectsToGroup.length == 0) {
            let toAdd = [];
            for (let i = lastPoint; i < ObjectsInGroups.length; i++) {
                toAdd.push(ObjectsInGroups[i]);
            }
            Groups.push(toAdd);
            lastPoint = ObjectsInGroups.length;

            let isFind = false;
            for (let i = 0; i < TreeToDivide.length; i++) {
                if (!ObjectsInGroups.includes(TreeToDivide[i])) {
                    ObjectsToGroup = [TreeToDivide[i]];
                    isFind = true;
                    break;
                }
            }
            if (!isFind) {
                break;
            }

            continue;
        }
        ObjectsToGroup = newObjectsToGroup;
    }
    return Groups;
}