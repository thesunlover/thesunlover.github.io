// правоъгълник в равнина(ABCD-> т.A, т.C ,(x1,y1), (x2,y2), ); два правоъгълника -> резултат intersection rectangle;
// Note: this one works only in the case where all sides are parallel to the axises
function P(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.eq = function (that) {
        return that.x === this.x && that.y === this.y;
    };
    this.toString = function (params) {
        return `(${this.x},${this.y})`;
    };
}
class Segment {
    constructor(pt1, pt2) {
        this.A = pt1;
        this.B = pt2;
    }
    toString = function (params) {
        return `Segment: {A:${this.A.toString()},B:${this.B.toString()}}`;
    };
}
// This one is Self-normalized Rectangle class
// where Normalized stands for:
//  point A to be the left bottom one
//  point C to be the right top one
class Rectangle {
    constructor(a, b, c, d) {
        this.A = a;
        this.B = b;
        this.C = c;
        this.D = d;
        this.normalize();
    }
    toString = function (params) {
        return `Rectangle: {A:${this.A.toString()},C:${this.C.toString()}}`;
    }
    // this.normalize = function(){}
    intersect = function (other) {
        const x5 = Math.max(this.A.x, other.A.x);
        const y5 = Math.max(this.A.y, other.A.y);

        const x6 = Math.min(this.C.x, other.C.x);
        const y6 = Math.min(this.C.y, other.C.y);
        if (x5===x6 || y5===y6) {
            
            return new Segment(
                new P('A', x5, y5),
                new P('C', x6, y6),
            );
        }

        return new Rectangle(
            new P('A', x5, y5),
            new P('B', x6, y5),
            new P('C', x6, y6),
            new P('D', x5, y6),
        );
    }
    // TODO: optimize performance and memory usage inside
    normalize = function () {
        let newA = this.A;
        let newAindex = 0;
        // let newC = this.C;
        // step 1: find the bottom left point
        const pointNames = ['A', 'B', 'C', 'D'];
        pointNames.forEach((name, index) => {
            // name stands for internalPointName
            let P = this[name];
            if (P.x < newA.x || P.y < newA.y) {
                newA = P;
                newAindex = index;
            }
        })

        // step 2: rotate the points
        let pointNamesRound = pointNames.concat(['A', 'B', 'C']);
        // FYI: pointNames = ['A', 'B', 'C', 'D', 'A', 'B', 'C'];
        const safeStorage = {}
        pointNamesRound.slice(newAindex, newAindex + 4).forEach((name, index) => {
            safeStorage[pointNames[index]] = this[name];
        });
        Object.assign(this, safeStorage);
    }
}


function findIntersection(r1, r2) {
    return r1.intersect(r2);
}

function testNormalize(count) {
    const Rn = new Rectangle(
        new P('A1', 7, 2),
        new P('B1', 7, -7),
        new P('C1', 20, -7),
        new P('D1', 20, 2),
    );

    while (count--) {
        Rn.normalize();
    }
    console.log(`normalized ${count} times`, Rn);
}
// testNormalize(1);
// testNormalize(2);
// testNormalize(3);

const TEST_DATA = [
    {// case 100% overlapping
        hint: '(a rectangle with itself, Figure 1)',
        r1: new Rectangle(
            new P('A', 0, 0),
            new P('B', 10, 0),
            new P('C', 10, 7),
            new P('D', 0, 7),
        ),
        r2: new Rectangle(
            new P('A1', 0, 0),
            new P('B1', 10, 0),
            new P('C1', 10, 7),
            new P('D1', 0, 7),
        ),
    },
    { // case black: 1 point D1 inside r1
        hint: '(the two back rectangles, Figure 1)',
        r1: new Rectangle(
            new P('A', 0, 0),
            new P('B', 10, 0),
            new P('C', 10, 7),
            new P('D', 0, 7),
        ),
        r2: new Rectangle(
            new P('A1', 7, 2),
            new P('B1', 7, -7),
            new P('C1', 20, -7),
            new P('D1', 20, 2),
        ),
    },
    { // case red: tangential
        hint: '(the black and the tangential red rectangle, Figure 1)',
        r1: new Rectangle(
            new P('A', 0, 0),
            new P('B', 10, 0),
            new P('C', 10, 7),
            new P('D', 0, 7),
        ),
        r2: new Rectangle(
            new P('A1', 10, 2),
            new P('B1', 15, 2),
            new P('C1', 15, 7),
            new P('D1', 10, 7),
        ),
    },
    { // case blue: 2 points B,C inside in r2
        hint: '(blue: 2 points B,C inside in r2, Figure 1)',
        r1: new Rectangle(
            new P('A', 0, 0),
            new P('B', 10, 0),
            new P('C', 10, 7),
            new P('D', 0, 7),
        ),
        r2: new Rectangle(
            new P('A1', 7, -7),
            new P('B1', 20, -7),
            new P('C1', 20, 10),
            new P('D1', 7, 10),
        ),
    },
    { // case red(r2) inside blue(r1)
        hint: '(red(r2) inside blue(r1), Figure 1)',
        r1: new Rectangle(
            new P('A', 7, -7),
            new P('B', 20, -7),
            new P('C', 20, 10),
            new P('D', 7, 10),
        ),
        r2: new Rectangle(
            new P('A1', 7, -7),
            new P('B1', 20, -7),
            new P('C1', 20, 10),
            new P('D1', 7, 10),
        ),
    },
    { // crossing case green(r1) and purple(r2)
        hint: '(crossing case green(r1) and purple(r2), Figure 2)',
        r1: new Rectangle(
            new P('A', 10, 0),
            new P('B', 20, 0),
            new P('C', 20, 30),
            new P('D', 10, 30),
        ),
        r2: new Rectangle(
            new P('A1', 0, 10),
            new P('B1', 30, 10),
            new P('C1', 30, 20),
            new P('D1', 0, 20),
        ),
    },
];

TEST_DATA.forEach((data) => {
    const resA = findIntersection(data.r1, data.r2);
    const resB = findIntersection(data.r2, data.r1);
    if (
        resA instanceof Rectangle && !(
            resA.A.eq(resB.A) && resA.B.eq(resB.B) &&
            resA.C.eq(resB.C) && resA.D.eq(resB.D)
        ) ||
        resA instanceof Segment && !(
            resA.A.eq(resB.A) && resA.B.eq(resB.B)
        )
    ) {
        throw Error("resA is different from resB", resA, resB);
    };
    console.log(['The intersesction of',
                data.hint,
                `\tr1:${data.r1},`,
                `\tr2:${data.r2},`,
                `Is:${resA}`
                 ].join('\n')
                );
})