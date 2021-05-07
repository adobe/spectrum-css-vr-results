'use strict';

const diffPixelArray = (oldPixelArr, newPixelArr) => {
  const M = newPixelArr.length;
  const N = oldPixelArr.length;
  const MAX = M + N;
  const V = [];
  V[0] = { x: -1, editHistory: [] }; // Greedy path candidates

  // Seed D(editLength) = 0, i.e. the content starts with the same values
  const _y = extractCommon(V[0], newPixelArr, oldPixelArr, 0);

  // Check if they are completely identical
  if (V[0].x + 1 >= M && _y + 1 >= N) {
    // Identity per the equality and tokenizer
    return [{ value: newPixelArr, count: newPixelArr.length }];
  }

  for (let D = 1; D <= MAX; D++) {
    for (let k = -1 * D; k <= D; k += 2) {
      const pathInsert = V[k - 1]; // Vertical path => k-1
      const pathRemove = V[k + 1]; // Horizantal path => k+1
      let y = (pathRemove ? pathRemove.x : 0) - k; // y = x - k
      let currentPath;

      if (pathInsert) {
        // No one else is going to attempt to use this value, clear it
        V[k - 1] = undefined;
      }

      const canAdd    = !!pathInsert && pathInsert.x + 1 < M; // Only need to check insert path.x because it goes downward
      const canRemove = !!pathRemove && y >= 0 && y < N; // Only need to check remove path.y because it goes rightward
      if (canAdd === false && canRemove === false) { // Out of bound
        // If this path is a terminal then prune
        V[k] = undefined;
        continue;
      }

      // Select the diagonal that we want to branch from. We select the prior
      // path whose position in the new string is the farthest from the origin
      // and does not pass the bounds of the diff graph
      if (canAdd === false || (canRemove && pathInsert.x < pathRemove.x)) { // V[k − 1] < V[k + 1]
        currentPath = clonePath(pathRemove); // x = V[k + 1]
        pushOps(currentPath.editHistory, false, true);
      } else {
        currentPath = pathInsert; // No need to clone, we've pulled it from the list
        currentPath.x = pathInsert.x + 1; // x = V[k − 1] + 1
        pushOps(currentPath.editHistory, true, false);
      }

      y = extractCommon(currentPath, newPixelArr, oldPixelArr, k); // While x < N and y < M and a(x + 1) = b(y + 1), advance x = x + 1 and y = y + 1

      // If we have hit the end of both strings, then we are done
      if (currentPath.x + 1 >= M && y + 1 >= N) {
        return buildValues(currentPath.editHistory, newPixelArr, oldPixelArr);
      } else {
        // Otherwise track this path as a potential candidate and continue.
        V[k] = currentPath;
      }
    }
  }
}

const pushOps = (editHistory, added, removed) => {
  const lastOps = editHistory[editHistory.length - 1];
  if (lastOps && lastOps.added === added && lastOps.removed === removed) {
    // We need to clone here as the component clone operation is just
    // as shallow array clone
    editHistory[editHistory.length - 1] = { count: lastOps.count + 1, added: added, removed: removed };
  } else {
    editHistory.push({ count: 1, added: added, removed: removed });
  }
}

const extractCommon = (currentPath, newPixelArr, oldPixelArr, k) => {
  const M = newPixelArr.length;
  const N = oldPixelArr.length;
  let   x = currentPath.x;
  let   y = x - k;
  let   commonCount = 0;

  while (x + 1 < M && y + 1 < N && newPixelArr[x + 1] === oldPixelArr[y + 1]) {
    x++;
    y++;
    commonCount++;
  }

  if (commonCount > 0) {
    currentPath.editHistory.push({ count: commonCount, added: false, removed: false });
    currentPath.x = x;
  }
  return y;
}

const buildValues = (editHistory, newPixelArr, oldPixelArr) => {
  for (let i = 0, x = 0, y = 0; i < editHistory.length; i++) {
    let editOps = editHistory[i];
    if (editOps.removed === true) {
      editOps.value = oldPixelArr.slice(y, y + editOps.count);
      y += editOps.count;

      // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.
      if (i > 0 && editHistory[i - 1].added === true) {
        let tmp = editHistory[i - 1];
        editHistory[i - 1] = editHistory[i];
        editHistory[i] = tmp;
      }
    }
    else if (editOps.added === true) {
      editOps.value = newPixelArr.slice(x, x + editOps.count);
      x += editOps.count;
    }
    else {
      editOps.value = newPixelArr.slice(x, x + editOps.count);
      x += editOps.count;
      y += editOps.count;
    }
  }
  return editHistory;
}

const clonePath = path => ({ x: path.x, editHistory: [...path.editHistory] });

if (typeof module !== 'undefined') {
  module.exports = diffPixelArray;
}
