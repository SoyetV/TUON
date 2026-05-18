/**
 * Shuffles the options array of a question and returns
 * a new object with the shuffled options + correctIndex.
 */
export function shuffleOptions(question) {
  const opts = [...question.options];
  const correct = opts[question.correct];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts, correctIndex: opts.indexOf(correct) };
}