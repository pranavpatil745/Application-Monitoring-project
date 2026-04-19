// util.js
async function doSomeHeavyTask() {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // simulates delay
  return "Task Complete";
}

module.exports = { doSomeHeavyTask };