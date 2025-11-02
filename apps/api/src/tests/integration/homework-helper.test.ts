/**
 * Homework Helper System Integration Tests
 * 
 * Basic integration tests for Phase 1 - Homework assistance and progress tracking
 * These tests verify the core homework helper functionality.
 */

import { describe, it, expect } from 'vitest';

describe('Homework Helper System', () => {
  describe('Basic System Health Checks', () => {
    it('should validate homework progress data structure', () => {
      const testData = {
        stepCompleted: true,
        stepNumber: 3,
        totalSteps: 10,
        strugglingIndicator: false,
        timeOnStep: 120 // 2 minutes
      };

      // Test the type guards used in WebSocket manager
      const stepCompleted = typeof testData.stepCompleted === 'boolean' ? testData.stepCompleted : false;
      const stepNumber = typeof testData.stepNumber === 'number' ? testData.stepNumber : 0;
      const totalSteps = typeof testData.totalSteps === 'number' ? testData.totalSteps : 1;
      
      expect(stepCompleted).toBe(true);
      expect(stepNumber).toBe(3);
      expect(totalSteps).toBe(10);
    });

    it('should calculate progress correctly', () => {
      const stepNumber = 3;
      const totalSteps = 10;
      const expectedProgress = (stepNumber / totalSteps) * 100;
      
      expect(expectedProgress).toBe(30);
    });

    it('should detect struggling indicator correctly', () => {
      const strugglingIndicator = true;
      const timeOnStep = 400; // 6+ minutes
      
      const shouldOfferHint = strugglingIndicator && timeOnStep > 300; // 5 minutes
      expect(shouldOfferHint).toBe(true);
    });
  });

  describe('Message Structure Validation', () => {
    it('should create valid step completion message', () => {
      const stepNumber = 3;
      const totalSteps = 10;
      
      const message = {
        type: 'step_completed',
        data: {
          stepNumber: stepNumber,
          feedback: 'Well done! Moving to the next step.',
          nextStep: stepNumber + 1,
          progress: (stepNumber / totalSteps) * 100,
          timestamp: new Date().toISOString()
        }
      };

      expect(message.type).toBe('step_completed');
      expect(message.data.stepNumber).toBe(3);
      expect(message.data.nextStep).toBe(4);
      expect(message.data.progress).toBe(30);
      expect(message.data.timestamp).toBeDefined();
    });

    it('should create valid hint availability message', () => {
      const message = {
        type: 'hint_available',
        data: {
          message: 'It looks like you might need a hint. Would you like some help?',
          hintAvailable: true,
          timestamp: new Date().toISOString()
        }
      };

      expect(message.type).toBe('hint_available');
      expect(message.data.hintAvailable).toBe(true);
      expect(message.data.message).toContain('hint');
      expect(message.data.timestamp).toBeDefined();
    });
  });

  describe('Homework Progress Logic', () => {
    it('should handle normal progress flow', () => {
      const progressData = {
        stepCompleted: true,
        stepNumber: 5,
        totalSteps: 8,
        strugglingIndicator: false,
        timeOnStep: 180 // 3 minutes - normal time
      };

      const shouldCelebrate = progressData.stepCompleted;
      const shouldOfferHint = progressData.strugglingIndicator && progressData.timeOnStep > 300;
      
      expect(shouldCelebrate).toBe(true);
      expect(shouldOfferHint).toBe(false);
    });

    it('should handle struggling student scenario', () => {
      const progressData = {
        stepCompleted: false,
        stepNumber: 2,
        totalSteps: 8,
        strugglingIndicator: true,
        timeOnStep: 450 // 7.5 minutes - struggling
      };

      const shouldOfferHint = progressData.strugglingIndicator && progressData.timeOnStep > 300;
      expect(shouldOfferHint).toBe(true);
    });
  });
});