import { 
  calculateNSQFLevel, 
  validateCredits, 
  getAllNSQFLevels,
  getCreditsForNextLevel 
} from '../utils/nsqf.util.js';

describe('NSQF Utility Functions', () => {
  describe('validateCredits', () => {
    it('should accept valid credits (1-40)', () => {
      expect(validateCredits(1)).toBe(true);
      expect(validateCredits(20)).toBe(true);
      expect(validateCredits(40)).toBe(true);
    });

    it('should reject credits outside range', () => {
      expect(validateCredits(0)).toBe(false);
      expect(validateCredits(41)).toBe(false);
      expect(validateCredits(-5)).toBe(false);
      expect(validateCredits(100)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(validateCredits(20.5)).toBe(false);
      expect(validateCredits(3.14)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(validateCredits('20')).toBe(false);
      expect(validateCredits(null)).toBe(false);
      expect(validateCredits(undefined)).toBe(false);
      expect(validateCredits({})).toBe(false);
    });
  });

  describe('calculateNSQFLevel', () => {
    it('should calculate Level 1 for 0-40 credits', () => {
      const result = calculateNSQFLevel(0);
      expect(result.level).toBe(1);
      expect(result.levelName).toBe('Basic/Foundation');
      
      const result2 = calculateNSQFLevel(40);
      expect(result2.level).toBe(1);
    });

    it('should calculate Level 2 for 41-80 credits', () => {
      const result = calculateNSQFLevel(41);
      expect(result.level).toBe(2);
      expect(result.levelName).toBe('Semi-skilled');
      
      const result2 = calculateNSQFLevel(80);
      expect(result2.level).toBe(2);
    });

    it('should calculate Level 5 for 161-200 credits', () => {
      const result = calculateNSQFLevel(180);
      expect(result.level).toBe(5);
      expect(result.levelName).toBe('Technician/Diploma');
    });

    it('should calculate Level 10 for 361+ credits', () => {
      const result = calculateNSQFLevel(361);
      expect(result.level).toBe(10);
      expect(result.levelName).toBe('Post-Doctoral');
      
      const result2 = calculateNSQFLevel(500);
      expect(result2.level).toBe(10);
    });

    it('should throw error for invalid credits', () => {
      expect(() => calculateNSQFLevel(-10)).toThrow();
      expect(() => calculateNSQFLevel('invalid')).toThrow();
    });
  });

  describe('getAllNSQFLevels', () => {
    it('should return all 10 NSQF levels', () => {
      const levels = getAllNSQFLevels();
      expect(levels).toHaveLength(10);
      expect(levels[0].level).toBe(1);
      expect(levels[9].level).toBe(10);
    });

    it('should include credit ranges for each level', () => {
      const levels = getAllNSQFLevels();
      levels.forEach(level => {
        expect(level).toHaveProperty('minCredits');
        expect(level).toHaveProperty('maxCredits');
        expect(level).toHaveProperty('description');
      });
    });
  });

  describe('getCreditsForNextLevel', () => {
    it('should calculate credits needed for next level', () => {
      const result = getCreditsForNextLevel(30);
      expect(result.currentLevel).toBe(1);
      expect(result.nextLevel).toBe(2);
      expect(result.creditsNeeded).toBe(11); // 41 - 30 = 11
    });

    it('should return 0 credits needed at level boundary', () => {
      const result = getCreditsForNextLevel(41);
      expect(result.currentLevel).toBe(2);
      expect(result.nextLevel).toBe(3);
      expect(result.creditsNeeded).toBe(40); // 81 - 41 = 40
    });

    it('should handle maximum level (10)', () => {
      const result = getCreditsForNextLevel(400);
      expect(result.currentLevel).toBe(10);
      expect(result.nextLevel).toBe(null);
      expect(result.creditsNeeded).toBe(0);
      expect(result.message).toBe('Maximum level reached');
    });
  });
});

describe('NSQF Level Mapping', () => {
  it('should map credits correctly to all levels', () => {
    const testCases = [
      { credits: 0, expectedLevel: 1 },
      { credits: 40, expectedLevel: 1 },
      { credits: 41, expectedLevel: 2 },
      { credits: 80, expectedLevel: 2 },
      { credits: 81, expectedLevel: 3 },
      { credits: 120, expectedLevel: 3 },
      { credits: 121, expectedLevel: 4 },
      { credits: 160, expectedLevel: 4 },
      { credits: 161, expectedLevel: 5 },
      { credits: 200, expectedLevel: 5 },
      { credits: 201, expectedLevel: 6 },
      { credits: 240, expectedLevel: 6 },
      { credits: 241, expectedLevel: 7 },
      { credits: 280, expectedLevel: 7 },
      { credits: 281, expectedLevel: 8 },
      { credits: 320, expectedLevel: 8 },
      { credits: 321, expectedLevel: 9 },
      { credits: 360, expectedLevel: 9 },
      { credits: 361, expectedLevel: 10 },
      { credits: 1000, expectedLevel: 10 },
    ];

    testCases.forEach(({ credits, expectedLevel }) => {
      const result = calculateNSQFLevel(credits);
      expect(result.level).toBe(expectedLevel);
    });
  });
});
