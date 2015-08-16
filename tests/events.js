describe('Events', function () {
    'use strict';

    it('triggers listeners', function () {
        var mockListener = {
            c1: function () {},
            c2: function () {}
        };

        spyOn(mockListener, 'c1');
        spyOn(mockListener, 'c2');

        Events.on('x', mockListener.c1);
        Events.on('x', mockListener.c2);
        Events.emit('x');

        expect(mockListener.c2).toHaveBeenCalled();
        expect(mockListener.c1).toHaveBeenCalled();
    });

    it('removes listeners', function (done) {
        var mockListener = {
            c1: function () {},
            c2: function () {
                done.fail('Removed callback has been called');
            }
        };

        spyOn(mockListener, 'c1');

        Events.on('x', mockListener.c1);
        Events.on('x', mockListener.c2);
        Events.off('x', mockListener.c2);
        Events.emit('x');

        expect(mockListener.c1).toHaveBeenCalled();
        done();
    });
});
