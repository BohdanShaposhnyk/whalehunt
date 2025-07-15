// Utility to trim an asset string to the format 'CHAIN.SYMBOL'
function trimAsset(asset) {
    const [first, second] = asset.split(/[-.]/);
    return `${first}.${second}`;
}

module.exports = trimAsset; 