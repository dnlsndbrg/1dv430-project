var Weapon = require("./Weapon");
var weaponData = require("../data/weapons").shotgun;
var Bullet = require(".././Bullet2");

class Shotgun extends Weapon{
    constructor(owner, existingWeaponData) {
        weaponData = existingWeaponData || weaponData;
        super(owner, weaponData);
    }
}

Shotgun.prototype.fire = function(action) {

    if (this.fireTimer < this.fireRate || this.reloading || this.bullets < 1) return false;

    this.bullets -= 1;
    this.fireTimer = 0;

    var directions = [];
    var direction;

    //var targetLocations = [];
    //var targetLocations;

    // shoot 4 bullets
    for (var i = 0; i < this.bulletsPerShot; i += 1) {

        if (!action.data.directions) {
            // randomize directions myself
            direction = this.owner.direction + Math.random() * 0.25 - 0.125;
            directions.push(direction);
        } else {
            direction = action.data.directions[i];
        }

        var bullet = new Bullet({
            x: this.owner.x,
            y: this.owner.y,
            targetX: this.owner.mouseX,
            targetY: this.owner.mouseY,
            direction:direction,
            damage: this.damage
        });

        // window.game.entities.push(new Bullet({
        //     x: this.owner.x,
        //     y: this.owner.y,
        //     targetX: this.owner.mouseX,
        //     targetY: this.owner.mouseY,
        //     direction: direction,
        //     bulletSpeed: this.bulletSpeed,
        //     damage: this.damage
        // }));
    }

    //console.log("FIRE", action, directions);
    action.data.directions = directions;


    return action;
};

module.exports = Shotgun;
