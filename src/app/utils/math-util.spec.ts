import { angleInDegreesBetweenVectorAndTowPoints } from "./math-util";

describe('angleBetweenVectorAndTowPoints', () => {
    it('Parallele vectors', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([1, 0], 0, 0, 1, 0);
        expect(result).toBe(0);
    });

    it('Parallele vectors 2', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([0, 1], 0, 0, 0, 1);
        expect(result).toBe(0);
    });


    it('90° vectors', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([1, 0], 0, 0, 0, 1);
        expect(result).toBe(90);
    });

    it('90° vectors 2', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([0, 1], 0, 0, -1, 0);
        expect(result).toBe(90);
    });

    it('-90° vectors', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([1, 0], 0, 0, 0, -1);
        expect(result).toBe(-90);
    });

    it('-90° vectors 2', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([0, 1], 0, 0, 1, 0);
        expect(result).toBe(-90);
    });

    it('180° vectors', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([1, 0], 0, 0, -1, 0);
        expect(result).toBe(180);
    });

    it('180° vectors 2', () => {
        const result = angleInDegreesBetweenVectorAndTowPoints([0, 1], 0, 0, 0, -1);
        expect(result).toBe(180);
    });

});