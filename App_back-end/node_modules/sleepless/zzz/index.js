
let sleepless = null;
(async function() {
    sleepless = await import("./sleepless.js");
})();

module.exports = sleepless;

