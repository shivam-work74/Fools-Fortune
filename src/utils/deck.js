// Deck creation, dealing, pair removal

export function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let id = 0;
  const deck = [];

  for (const s of suits) {
    for (const r of ranks) {
      // RULE: Remove Queen of Clubs (♣) to make the Queen of Spades (or others) the Old Maid
      if (r === "Q" && s === "♣") {
        continue;
      }
      deck.push({ id: `c${id++}`, rank: r, suit: s, isJoker: false });
    }
  }

  // Shuffle using Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Scans a hand and removes all pairs (by rank).
 * Returns { hand: Card[], discards: Card[] }
 * Logic:
 * - 2 of a kind -> Discard both
 * - 3 of a kind -> Discard 2, Keep 1
 * - 4 of a kind -> Discard 4 (2 pairs)
 */
export function removePairsAndReturnRemoved(hand = []) {
  const counts = new Map(); // rank -> [cards]
  const discards = [];
  const kept = [];

  // Group by rank
  for (const c of hand) {
    if (!counts.has(c.rank)) {
      counts.set(c.rank, []);
    }
    counts.get(c.rank).push(c);
  }

  // Process groups
  for (const [rank, cards] of counts) {
    while (cards.length >= 2) {
      // Remove a pair
      discards.push(cards.pop()); // 1st
      discards.push(cards.pop()); // 2nd
    }
    // Whatever is left (0 or 1) is kept
    if (cards.length > 0) {
      kept.push(cards[0]);
    }
  }

  return { hand: kept, discards };
}

/**
 * Checks if 'card' makes a pair with anything in 'hand'.
 * If yes, returns the matching card from hand.
 * If no, returns null.
 */
export function findPair(hand, card) {
  return hand.find(c => c.rank === card.rank) || null;
}

// Deal cards to any number of players one by one
export function dealToPlayers(deck, numPlayers = 2) {
  const hands = Array.from({ length: numPlayers }, () => []);
  deck.forEach((card, i) => hands[i % numPlayers].push(card));
  return hands;
}
