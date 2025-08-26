// Deck creation, dealing, pair removal
export function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let id = 0;
  const deck = [];

  for (const s of suits) {
    for (const r of ranks) {
      deck.push({ id: `c${id++}`, rank: r, suit: s, isJoker: false });
    }
  }

  // Add single Joker
  deck.push({ id: `c${id++}`, rank: "JOKER", suit: "🃏", isJoker: true });

  // Shuffle using Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Remove pairs from a hand and return remaining hand + discarded pairs
export function removePairsAndReturnRemoved(hand = []) {
  const waiting = new Map();
  const discards = [];
  const jokers = [];

  for (const c of hand) {
    if (c.isJoker) { jokers.push(c); continue; }
    const key = c.rank;
    if (waiting.has(key)) {
      discards.push(waiting.get(key), c);
      waiting.delete(key);
    } else {
      waiting.set(key, c);
    }
  }

  return { hand: [...jokers, ...Array.from(waiting.values())], discards };
}

// Deal cards to any number of players
export function dealToPlayers(deck, numPlayers = 2) {
  const hands = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, i) => hands[i % numPlayers].push(card));
  return hands;
}
