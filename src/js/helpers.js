// degrees to radians
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

function toDegrees(rad) {
    return rad * (180 / Math.PI);
}

module.exports = {
    toRadians: toRadians,
    toDegrees: toDegrees
};
