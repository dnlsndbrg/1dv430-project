var intersection = require("./intersection");

function lineRectIntersect(line, rect) {

        //if (point is inside rect)
        // intersect = point;

        // check left
        var left = {start:{x: rect.x, y: rect.y}, end:{x: rect.x, y: rect.y + rect.h}};
        var leftIntersect = intersection.intersect(line,left);
        if (leftIntersect.y >= left.start.y && leftIntersect.y <= left.end.y && line.start.x <= left.start.x ) {
            leftIntersect.x += 1;
            return leftIntersect;
        }

        // check top
        var top = {start:{x: rect.x, y: rect.y}, end:{x: rect.x + rect.w, y: rect.y}};
        var topIntersect = intersection.intersect(line, top);
        if (topIntersect.x >= top.start.x && topIntersect.x <= top.end.x && line.start.y <= top.start.y) {
            topIntersect.y += 1;
            return topIntersect;

        }

        // check right
        var right = {start:{x: rect.x + rect.w ,y: rect.y }, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
        var rightIntersect = intersection.intersect(line, right);
        if (rightIntersect.y >= right.start.y && rightIntersect.y < right.end.y) {
            rightIntersect.x -= 1;
            return rightIntersect;

        }

        // check down
        var down = {start:{x: rect.x, y: rect.y + rect.h}, end:{x: rect.x + rect.w, y: rect.y + rect.h}};
        var downIntersect = intersection.intersect(line, down);
        topIntersect.y -= 1;
        return downIntersect;
}

function pointCircle(point, circle) {
        var a = point.x - circle.x;
        var b = point.y - circle.y;
        var distance = Math.sqrt( a*a + b*b );
        if (distance < circle.radius) { // point is inside circle
            return true;
        }
}

module.exports = {
    lineRectIntersect: lineRectIntersect,
    pointCircle: pointCircle
};
