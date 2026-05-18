import { RANKS } from "./constants";

export function getRank(xp) {
  return RANKS.find((r) => xp >= r.min && xp <= r.max) || RANKS[0];
}

export function getLevel(xp) {
  return Math.floor(xp / 200) + 1;
}

export function getNextRankXP(xp) {
  const rank = getRank(xp);
  return rank.max === Infinity ? null : rank.max + 1;
}