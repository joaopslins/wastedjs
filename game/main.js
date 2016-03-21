function main() {
    var IF = new Interface("interface");

    deck = new Deck();

    players = [
        new Player(),
        new Player(),
        new Player()
    ];

    player = players[0];



    deck.generate();
    deck.shuffle();

    deck.distribute(players, 3);
}
