function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // swap
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = shuffleArray;