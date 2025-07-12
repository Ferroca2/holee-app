"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = void 0;
// Function to split an array into fixed-size batches
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
exports.chunkArray = chunkArray;
//# sourceMappingURL=chunkArray.js.map