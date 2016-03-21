/** Player
 *
 * A player of Fodinha.
 */
function Player() {
    this.lives = Player.prototype.LIVES;

    this.hand = new Deck();
    this.chosen = false;
}

Player.prototype.LIVES = 3;

Player.prototype.pega = function(card) {
    this.hand.push(card);
};

Player.prototype.play = function() {
    var card = this.hand.remove(this.chosen);
    this.chosen = false;

    return card;
};

Player.prototype.choose = function(choice) {
    this.chosen = choice;
};

Player.prototype.toString = function() {
    return ''+ this.hand;
};