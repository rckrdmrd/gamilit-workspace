/**
 * LTI Entities Unit Tests
 *
 * Tests for LTI entity definitions and structure.
 * Note: LTI module currently only has entities - services will be added
 * when Epic EXT-007 is activated.
 */

import { LtiConsumer } from '../entities/lti-consumer.entity';
import { LtiSession } from '../entities/lti-session.entity';
import { LtiGradePassback } from '../entities/lti-grade-passback.entity';

describe('LTI Entities', () => {
  describe('LtiConsumer', () => {
    let consumer: LtiConsumer;

    beforeEach(() => {
      consumer = new LtiConsumer();
    });

    it('should be defined', () => {
      expect(consumer).toBeDefined();
    });

    it('should accept all required LTI 1.3 configuration fields', () => {
      // Arrange & Act
      consumer.id = 'consumer-1';
      consumer.platformId = 'https://canvas.instructure.com';
      consumer.clientId = 'client-123456';
      consumer.deploymentId = 'deploy-001';
      consumer.publicKeysetUrl = 'https://canvas.instructure.com/api/lti/security/jwks';
      consumer.accessTokenUrl = 'https://canvas.instructure.com/login/oauth2/token';
      consumer.authorizationUrl = 'https://canvas.instructure.com/api/lti/authorize';
      consumer.platformName = 'Canvas LMS';

      // Assert
      expect(consumer.platformId).toBe('https://canvas.instructure.com');
      expect(consumer.clientId).toBe('client-123456');
      expect(consumer.publicKeysetUrl).toContain('jwks');
    });

    it('should have LTI Advantage support flags', () => {
      // Arrange & Act
      consumer.supportsDeepLinking = true;
      consumer.supportsNrps = true;
      consumer.supportsAgs = true;

      // Assert
      expect(consumer.supportsDeepLinking).toBe(true);
      expect(consumer.supportsNrps).toBe(true);
      expect(consumer.supportsAgs).toBe(true);
    });

    it('should support custom parameters as JSON', () => {
      // Arrange
      const customParams = {
        custom_course_id: '12345',
        custom_section_id: '67890',
      };

      // Act
      consumer.customParameters = customParams;

      // Assert
      expect(consumer.customParameters).toEqual(customParams);
      expect(consumer.customParameters.custom_course_id).toBe('12345');
    });

    it('should have activation and verification flags', () => {
      // Arrange & Act
      consumer.isActive = true;
      consumer.isVerified = false;

      // Assert
      expect(consumer.isActive).toBe(true);
      expect(consumer.isVerified).toBe(false);
    });

    it('should support legacy LTI 1.1 credentials (optional)', () => {
      // Arrange & Act
      consumer.consumerKey = 'legacy-key';
      consumer.consumerSecret = 'legacy-secret';

      // Assert
      expect(consumer.consumerKey).toBe('legacy-key');
      expect(consumer.consumerSecret).toBe('legacy-secret');
    });
  });

  describe('LtiSession', () => {
    let session: LtiSession;

    beforeEach(() => {
      session = new LtiSession();
    });

    it('should be defined', () => {
      expect(session).toBeDefined();
    });

    it('should store LTI launch identifiers', () => {
      // Arrange & Act
      session.id = 'session-1';
      session.consumerId = 'consumer-1';
      session.launchId = 'launch-abc-123';
      session.messageType = 'LtiResourceLinkRequest';

      // Assert
      expect(session.launchId).toBe('launch-abc-123');
      expect(session.messageType).toBe('LtiResourceLinkRequest');
    });

    it('should store LMS context information', () => {
      // Arrange & Act
      session.contextId = 'course-12345';
      session.contextLabel = 'CS101';
      session.contextTitle = 'Introduction to Computer Science';

      // Assert
      expect(session.contextId).toBe('course-12345');
      expect(session.contextLabel).toBe('CS101');
      expect(session.contextTitle).toBe('Introduction to Computer Science');
    });

    it('should store resource link information', () => {
      // Arrange & Act
      session.resourceLinkId = 'resource-789';
      session.resourceLinkTitle = 'Module 1 Quiz';
      session.resourceLinkDescription = 'Assessment for Module 1';

      // Assert
      expect(session.resourceLinkId).toBe('resource-789');
      expect(session.resourceLinkTitle).toBe('Module 1 Quiz');
    });

    it('should store LMS user information', () => {
      // Arrange & Act
      session.lmsUserId = 'lms-user-456';
      session.lmsUserEmail = 'student@university.edu';
      session.lmsUserName = 'John Student';
      session.lmsUserRoles = ['Learner', 'Student'];

      // Assert
      expect(session.lmsUserId).toBe('lms-user-456');
      expect(session.lmsUserRoles).toContain('Learner');
    });

    it('should store ID token claims as JSON', () => {
      // Arrange
      const claims = {
        iss: 'https://canvas.instructure.com',
        sub: 'lms-user-456',
        aud: 'client-123',
        exp: 1700000000,
        iat: 1699999000,
        nonce: 'abc123',
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
      };

      // Act
      session.idTokenClaims = claims;

      // Assert
      expect(session.idTokenClaims.iss).toBe('https://canvas.instructure.com');
      expect(session.idTokenClaims.sub).toBe('lms-user-456');
    });

    it('should have locale and timezone settings', () => {
      // Arrange & Act
      session.locale = 'en-US';
      session.timezone = 'America/Los_Angeles';

      // Assert
      expect(session.locale).toBe('en-US');
      expect(session.timezone).toBe('America/Los_Angeles');
    });

    it('should have return URL for LMS navigation', () => {
      // Arrange & Act
      session.returnUrl = 'https://canvas.instructure.com/courses/123/external_tools/456';

      // Assert
      expect(session.returnUrl).toContain('external_tools');
    });

    it('should track session state', () => {
      // Arrange & Act
      session.isActive = true;
      session.sessionState = 'active';
      session.endedAt = null;

      // Assert
      expect(session.isActive).toBe(true);
      expect(session.endedAt).toBeNull();
    });
  });

  describe('LtiGradePassback', () => {
    let gradePassback: LtiGradePassback;

    beforeEach(() => {
      gradePassback = new LtiGradePassback();
    });

    it('should be defined', () => {
      expect(gradePassback).toBeDefined();
    });

    it('should store grade information', () => {
      // Arrange & Act
      gradePassback.id = 'grade-1';
      gradePassback.sessionId = 'session-123';
      gradePassback.userId = 'user-456';
      gradePassback.consumerId = 'consumer-789';
      gradePassback.scoreGiven = 85;
      gradePassback.scoreMaximum = 100;
      gradePassback.scorePercentage = 85.00;

      // Assert
      expect(gradePassback.scoreGiven).toBe(85);
      expect(gradePassback.scoreMaximum).toBe(100);
      expect(gradePassback.scorePercentage).toBe(85.00);
    });

    it('should store AGS lineitem information', () => {
      // Arrange & Act
      gradePassback.lineitemUrl = 'https://canvas.instructure.com/api/lti/courses/123/line_items/456';
      gradePassback.lineitemId = 'lineitem-456';
      gradePassback.lineitemLabel = 'Module 1 Quiz';

      // Assert
      expect(gradePassback.lineitemUrl).toContain('line_items');
      expect(gradePassback.lineitemLabel).toBe('Module 1 Quiz');
    });

    it('should store passback status', () => {
      // Arrange & Act
      gradePassback.passbackStatus = 'pending' as any;
      gradePassback.firstSentAt = null;
      gradePassback.lastSentAt = null;

      // Assert
      expect(gradePassback.passbackStatus).toBe('pending');
      expect(gradePassback.firstSentAt).toBeNull();
    });

    it('should support activity progress tracking (LTI Spec)', () => {
      // Arrange & Act
      gradePassback.activityProgress = 'Completed' as any;
      gradePassback.gradingProgress = 'FullyGraded' as any;

      // Assert
      expect(gradePassback.activityProgress).toBe('Completed');
      expect(gradePassback.gradingProgress).toBe('FullyGraded');
    });

    it('should store error information on failure', () => {
      // Arrange & Act
      gradePassback.passbackStatus = 'failed' as any;
      gradePassback.errorMessage = 'LMS rejected the grade submission';
      gradePassback.attemptCount = 3;
      gradePassback.lmsResponseCode = 400;

      // Assert
      expect(gradePassback.errorMessage).toContain('rejected');
      expect(gradePassback.attemptCount).toBe(3);
      expect(gradePassback.lmsResponseCode).toBe(400);
    });

    it('should store LMS response as JSON', () => {
      // Arrange
      const lmsResponse = {
        success: false,
        error: {
          code: 'INVALID_SCORE',
          message: 'Score exceeds maximum',
        },
      };

      // Act
      gradePassback.lmsResponse = lmsResponse;

      // Assert
      expect(gradePassback.lmsResponse).toEqual(lmsResponse);
      expect((gradePassback.lmsResponse.error as any).code).toBe('INVALID_SCORE');
    });

    it('should support retry configuration', () => {
      // Arrange & Act
      gradePassback.attemptCount = 2;
      gradePassback.maxRetries = 5;
      gradePassback.nextRetryAt = new Date('2026-01-16T12:00:00Z');

      // Assert
      expect(gradePassback.attemptCount).toBe(2);
      expect(gradePassback.maxRetries).toBe(5);
      expect(gradePassback.nextRetryAt).toEqual(new Date('2026-01-16T12:00:00Z'));
    });

    it('should support feedback comment', () => {
      // Arrange & Act
      gradePassback.comment = 'Great work on the quiz!';

      // Assert
      expect(gradePassback.comment).toBe('Great work on the quiz!');
    });
  });
});
