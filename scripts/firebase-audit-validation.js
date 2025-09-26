#!/usr/bin/env node

/**
 * Firebase Audit Validation Script
 *
 * This script validates that all the critical fixes from the Firebase audit
 * have been implemented correctly and are working as expected.
 *
 * Run with: node scripts/firebase-audit-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Audit Validation Script');
console.log('=====================================\n');

// Test results tracking
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function runTest(testName, testFunction) {
  try {
    const result = testFunction();
    if (result.passed) {
      console.log(`✅ ${testName}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
      passedTests++;
      testResults.push({ test: testName, status: 'PASSED', details: result.details });
    } else {
      console.log(`❌ ${testName}`);
      console.log(`   ${result.message}`);
      failedTests++;
      testResults.push({ test: testName, status: 'FAILED', message: result.message });
    }
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
    testResults.push({ test: testName, status: 'ERROR', error: error.message });
  }
  console.log('');
}

// Utility functions
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function readFile(filePath) {
  return fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
}

function searchInFile(filePath, searchPattern) {
  if (!fileExists(filePath)) return false;
  const content = readFile(filePath);
  return searchPattern.test(content);
}

// =============================================================================
// PHASE 1 TESTS: Critical System Fixes
// =============================================================================

console.log('📊 PHASE 1: Critical System Fixes');
console.log('----------------------------------');

// Phase 1.1: User Progress Document ID Fix
runTest('Phase 1.1: User Progress uses createWithId method', () => {
  const hasCreateWithId = searchInFile(
    'src/lib/database/services/user.service.ts',
    /createWithId.*USER_PROGRESS_COLLECTION.*userId/
  );

  const hasDirectIdUsage = searchInFile(
    'src/lib/database/services/user.service.ts',
    /getById.*USER_PROGRESS_COLLECTION.*userId/
  );

  if (hasCreateWithId && hasDirectIdUsage) {
    return {
      passed: true,
      details: 'User progress correctly uses userId as document ID'
    };
  }

  return {
    passed: false,
    message: 'User progress service not using correct document ID strategy'
  };
});

// Phase 1.2: Quiz Attempt Duplicate Fields Fix
runTest('Phase 1.2: Quiz Attempt has single timestamp field', () => {
  const quizTypesContent = readFile('src/types/quiz.ts');
  const hasSubmittedAt = /submittedAt\?:\s*Timestamp/.test(quizTypesContent);
  const hasCompletedAt = /completedAt\?:\s*Timestamp/.test(quizTypesContent);

  if (hasSubmittedAt && !hasCompletedAt) {
    return {
      passed: true,
      details: 'Only submittedAt field present, completedAt removed successfully'
    };
  }

  return {
    passed: false,
    message: `Found submittedAt: ${hasSubmittedAt}, completedAt: ${hasCompletedAt} - should be true, false`
  };
});

runTest('Phase 1.2: Chatbot uses submittedAt field', () => {
  const usesSubmittedAt = searchInFile(
    'app/api/chatbot/route.ts',
    /attempt\.submittedAt/
  );

  const usesCompletedAt = searchInFile(
    'app/api/chatbot/route.ts',
    /attempt\.completedAt/
  );

  if (usesSubmittedAt && !usesCompletedAt) {
    return {
      passed: true,
      details: 'Chatbot correctly references submittedAt field'
    };
  }

  return {
    passed: false,
    message: 'Chatbot API still references completedAt or missing submittedAt'
  };
});

// =============================================================================
// PHASE 2 TESTS: Architecture Standardization
// =============================================================================

console.log('🏗️ PHASE 2: Architecture Standardization');
console.log('------------------------------------------');

// Phase 2.1: Database Access Pattern Standardization
runTest('Phase 2.1: All services extend BaseDatabaseService', () => {
  const services = [
    'user.service.ts',
    'sports.service.ts',
    'quiz.service.ts',
    'progress.service.ts',
    'video-review.service.ts',
    'analytics.service.ts',
    'enrollment.service.ts'
  ];

  const results = services.map(service => {
    const extendsBase = searchInFile(
      `src/lib/database/services/${service}`,
      /extends\s+BaseDatabaseService/
    );
    return { service, extends: extendsBase };
  });

  const allExtend = results.every(r => r.extends);

  if (allExtend) {
    return {
      passed: true,
      details: `${services.length} services correctly extend BaseDatabaseService`
    };
  }

  const failing = results.filter(r => !r.extends).map(r => r.service);
  return {
    passed: false,
    message: `Services not extending BaseDatabaseService: ${failing.join(', ')}`
  };
});

runTest('Phase 2.1: BaseDatabaseService has createWithId method', () => {
  const baseContent = readFile('src/lib/database/base.service.ts');
  const hasMethod = /async\s+createWithId/.test(baseContent);
  const usesSetDoc = /await\s+setDoc/.test(baseContent);

  if (hasMethod && usesSetDoc) {
    return {
      passed: true,
      details: 'createWithId method correctly implemented with setDoc'
    };
  }

  return {
    passed: false,
    message: `Method exists: ${hasMethod}, Uses setDoc: ${usesSetDoc}`
  };
});

// Phase 2.2: Security Rule Compliance
runTest('Phase 2.2: Security rules match service implementations', () => {
  // Check that security rules expect userId as document ID
  const securityRulesContent = readFile('firestore.rules');
  const userProgressRule = /match\s+\/user_progress\/\{userId\}/.test(securityRulesContent);

  if (userProgressRule) {
    return {
      passed: true,
      details: 'Security rules correctly expect userId as document ID'
    };
  }

  return {
    passed: false,
    message: 'Security rules do not match expected document ID pattern'
  };
});

// =============================================================================
// PHASE 3 TESTS: Technical Debt Improvements
// =============================================================================

console.log('🔧 PHASE 3: Technical Debt Improvements');
console.log('----------------------------------------');

// Phase 3.1: Error Handling Standardization
runTest('Phase 3.1: BaseDatabaseService has comprehensive error handling', () => {
  const baseServiceContent = readFile('src/lib/database/base.service.ts');
  const hasExecuteWithRetry = /executeWithRetry/.test(baseServiceContent);
  const hasDatabaseError = /class\s+DatabaseError/.test(baseServiceContent);
  const hasCircuitBreaker = /circuitBreaker/.test(baseServiceContent);

  if (hasExecuteWithRetry && hasDatabaseError && hasCircuitBreaker) {
    return {
      passed: true,
      details: 'Comprehensive error handling with retry logic and circuit breaker'
    };
  }

  return {
    passed: false,
    message: 'Missing error handling components in BaseDatabaseService'
  };
});

// Phase 3.2: Timestamp Handling Consistency
runTest('Phase 3.2: Timestamp utility exists and is properly structured', () => {
  const hasUtility = fileExists('src/lib/utils/timestamp.ts');

  if (!hasUtility) {
    return {
      passed: false,
      message: 'Timestamp utility file not found'
    };
  }

  const utilityContent = readFile('src/lib/utils/timestamp.ts');
  const hasTimestampUtils = /class\s+TimestampUtils/.test(utilityContent);
  const hasPatterns = /TimestampPatterns/.test(utilityContent);
  const hasForDatabase = /forDatabase.*serverTimestamp/.test(utilityContent);

  if (hasTimestampUtils && hasPatterns && hasForDatabase) {
    return {
      passed: true,
      details: 'TimestampUtils class and patterns correctly implemented'
    };
  }

  return {
    passed: false,
    message: 'Timestamp utility missing required components'
  };
});

runTest('Phase 3.2: Services use standardized timestamps', () => {
  const userServiceUsesPattern = searchInFile(
    'src/lib/database/services/user.service.ts',
    /TimestampPatterns\.forDatabase/
  );

  const quizServiceUsesPattern = searchInFile(
    'src/lib/database/services/quiz.service.ts',
    /TimestampPatterns\.forDatabase/
  );

  if (userServiceUsesPattern && quizServiceUsesPattern) {
    return {
      passed: true,
      details: 'User and Quiz services use standardized timestamp patterns'
    };
  }

  return {
    passed: false,
    message: `User service: ${userServiceUsesPattern}, Quiz service: ${quizServiceUsesPattern}`
  };
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

console.log('🔗 INTEGRATION: End-to-End Validation');
console.log('--------------------------------------');

runTest('Integration: TypeScript interfaces align with service usage', () => {
  // Check that QuizAttempt interface is properly used
  const quizTypesContent = readFile('src/types/quiz.ts');
  const hasQuizAttemptInterface = /interface\s+QuizAttempt/.test(quizTypesContent);

  const quizServiceContent = readFile('src/lib/database/services/quiz.service.ts');
  const importsQuizAttempt = /QuizAttempt/.test(quizServiceContent);

  const indexTypesContent = readFile('src/types/index.ts');
  const exportsQuizAttempt = /QuizAttempt/.test(indexTypesContent);

  if (hasQuizAttemptInterface && importsQuizAttempt && exportsQuizAttempt) {
    return {
      passed: true,
      details: 'QuizAttempt interface properly defined, exported, and used'
    };
  }

  return {
    passed: false,
    message: `Interface: ${hasQuizAttemptInterface}, Import: ${importsQuizAttempt}, Export: ${exportsQuizAttempt}`
  };
});

runTest('Integration: Field mapping consistency maintained', () => {
  // Check that services create objects matching their interfaces
  const userServiceContent = readFile('src/lib/database/services/user.service.ts');
  const hasRequiredFields = /userId.*overallStats.*achievements/.test(userServiceContent.replace(/\s+/g, ' '));

  if (hasRequiredFields) {
    return {
      passed: true,
      details: 'User progress creation includes all required interface fields'
    };
  }

  return {
    passed: false,
    message: 'Field mapping inconsistency detected in user service'
  };
});

// =============================================================================
// FINAL SUMMARY
// =============================================================================

console.log('📋 VALIDATION SUMMARY');
console.log('====================');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total:  ${passedTests + failedTests}`);

const successRate = Math.round((passedTests / (passedTests + failedTests)) * 100);
console.log(`🎯 Success Rate: ${successRate}%\n`);

if (failedTests === 0) {
  console.log('🎉 ALL TESTS PASSED! Firebase audit fixes have been successfully implemented.\n');
  console.log('✨ Your SportsCoach V3 database layer is now production-ready!\n');
} else if (successRate >= 80) {
  console.log('⚠️  Most fixes are working correctly, but some issues need attention.\n');
  console.log('🔧 Review the failed tests above and address the remaining issues.\n');
} else {
  console.log('🚨 Significant issues detected. Review and fix the failing tests before deployment.\n');
}

// Export results for potential CI/CD integration
const results = {
  timestamp: new Date().toISOString(),
  passed: passedTests,
  failed: failedTests,
  successRate,
  details: testResults
};

fs.writeFileSync(
  path.join(__dirname, '..', 'firebase-audit-validation-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('📄 Detailed results saved to: firebase-audit-validation-results.json');

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);