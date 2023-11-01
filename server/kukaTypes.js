/********************************
* kukaTypes.js
* data types coming off the robo
* types, and helper methods
*********************************/


export class Frame_t {

    static positionKeys = ['X', 'Y', 'Z'];
    static angleKeys = ['A', 'B', 'C'];
    static poseKeys = this.positionKeys.concat(this.angleKeys);

    constructor(x = 0, y = 0, z = 0, a = 0, b = 0, c = 0) {
        this.X = x;
        this.Y = y;
        this.Z = z;
        this.A = a;
        this.B = b;
        this.C = c;
    }

    static add(A, B) {
        let f = new FRAME_t(
            A.X + B.X,
            A.Y + B.Y,
            A.Z + B.Z,
            A.A + B.A,
            A.B + B.B,
            A.C + B.C
        );
        return f;
    }
    
    // EVERYTHING BELOW THIS NEEDS TO BE CHECKD

    static constrainC(frame) {
        console.log('constraining f.c before: ' + frame.C);
        if (frame.C >= 0) {
            frame.C = Math.min(190, Math.max(frame.C, 135));
        } else if (frame.C <= 0) {
            frame.C = Math.min(-170, Math.max(frame.C, -2250));
        }
        console.log('constraining f.c after: ' + frame.C);
    }

    static constrain(frame, limits) {
        frame.x = Math.min(Math.max(frame.x, limits.x[0]), limits.x[1]);
        frame.y = Math.min(Math.max(frame.y, limits.y[0]), limits.y[1]);
        frame.z = Math.min(Math.max(frame.z, limits.z[0]), limits.z[1]);

        frame.a = Math.sign(frame.a) * Math.min(Math.max(Math.abs(frame.a), limits.a[0]), limits.a[1]);
        frame.b = Math.sign(frame.b) * Math.min(Math.max(Math.abs(frame.b), limits.b[0]), limits.b[1]);

        if (Math.abs(frame.c) > frame.c[1]) { frame.c = -1 * Math.sign(frame.c) * (limits.c[1] - (limits.c[1] - Math.abs(frame.c))); }
        frame.c = Math.sign(frame.c) * Math.min(Math.max(Math.abs(frame.c), limits.c[0]), limits.c[1]);
    };


    // return a global within or not 
    static within(frame, limits) {
        for (const elt of this.poseKeys) {
            if (elt === 'c') { // special checking for C, check notes on 2/21
                if (Math.abs(frame[elt]) < limits[elt][0] || Math.abs(frame[elt]) > limits[elt][1]) {
                    return false;
                }
            }
            else // not special C axis
                if (frame[elt] > limits[elt][1] || frame[elt] < limits[elt][0]) {
                    console.warn(`${elt} axis is not within bounds`)
                    return false;
                }
        }
        return true; // checks out

    };
}

// module.exports = FRAME_t;