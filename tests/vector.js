var Vector = require('../src/vector.js').Vector;

describe('Map', function () {

    it('clones itself', function () {
        var vector = new Vector(1, 2, 3);
        var clone = vector.clone();

        expect(vector).toEqual(clone);
    });
});
