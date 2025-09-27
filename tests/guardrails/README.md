# Guardrail Tests for OnboardingAudit.ai

## Purpose

Guardrail tests are designed to verify that the heuristic detection system is robust against common UI trickery that could artificially inflate scores. These tests ensure that the scoring algorithms correctly identify and ignore elements that are designed to fool the system.

## Test Fixtures

### 1. Invisible CTA Test (`invisible-cta-001`)

**Purpose**: Verify that CTAs positioned off-screen are not detected as valid call-to-action elements.

**Implementation**: 
- Contains a visible CTA button with "Get Started" text
- Contains an invisible CTA positioned at `left: -9999px` with "Start Now" text
- The invisible CTA should be ignored by the detection algorithm

**Expected Behavior**: Only the visible CTA should be detected and scored.

### 2. ARIA Hidden Elements Test (`aria-hidden-headings-002`)

**Purpose**: Verify that elements with `aria-hidden="true"` are excluded from text analysis and heuristic detection.

**Implementation**:
- Contains visible headings and paragraphs
- Contains headings with `aria-hidden="true"` attribute
- Hidden elements contain poor quality text (long sentences, jargon)

**Expected Behavior**: Only visible, accessible text should be analyzed for copy clarity.

### 3. Hidden Copy Text Test (`hidden-copy-003`)

**Purpose**: Verify that text hidden with CSS (`display: none`, `visibility: hidden`, `opacity: 0`) is ignored in copy analysis.

**Implementation**:
- Contains visible, well-written copy
- Contains hidden text with poor quality (long sentences, passive voice, jargon)
- Hidden text uses various CSS techniques to hide from view

**Expected Behavior**: Only visible text should contribute to copy clarity scoring.

### 4. Fake Trust Signals Test (`fake-trust-signals-004`)

**Purpose**: Verify that empty trust signal containers are not counted as valid trust markers.

**Implementation**:
- Contains empty testimonial containers with proper CSS classes
- Contains empty security badge containers
- Contains empty customer logo containers
- All containers have no actual content or images

**Expected Behavior**: Empty containers should not be counted as trust signals.

### 5. Decoy Buttons Test (`decoy-buttons-005`)

**Purpose**: Verify that disabled buttons and fake CTAs are not detected as valid call-to-action elements.

**Implementation**:
- Contains a real, enabled CTA button
- Contains disabled buttons with CTA-like text
- Contains buttons with `pointer-events: none`
- Contains fake buttons that look like CTAs but aren't actionable

**Expected Behavior**: Only actionable, enabled buttons should be detected as CTAs.

## Running the Tests

### Standalone Test Runner

```bash
# Run all guardrail tests
node tests/guardrails/run-guardrail-tests.mjs

# Run with verbose output
node tests/guardrails/run-guardrail-tests.mjs --verbose

# Show help
node tests/guardrail-tests.mjs --help
```

### Integration with Main Test Suite

The guardrail tests are also integrated into the main test suite in `packages/core/src/scoring.test.ts`. These tests verify that the scoring functions handle edge cases correctly:

```bash
# Run all tests including guardrail tests
npm test

# Run only scoring tests
npm test packages/core/src/scoring.test.ts
```

## Test Results

The test runner generates a detailed report showing:
- Which tests passed/failed
- Specific issues detected
- Scores for each heuristic
- Comparison with expected behavior

Results are saved to `tests/guardrails/guardrail-results.json` for detailed analysis.

## Expected Failures

If any guardrail tests fail, it indicates that the heuristic detection system may be vulnerable to the specific type of UI trickery being tested. This should be addressed by:

1. **Reviewing the detection logic** for the affected heuristic
2. **Adding additional filters** to exclude hidden/inactive elements
3. **Improving DOM traversal** to better identify visible, actionable elements
4. **Updating CSS selector logic** to avoid false positives

## Adding New Guardrail Tests

To add a new guardrail test:

1. Create a new directory under `tests/guardrails/` with a descriptive name
2. Add an `index.html` file with the tricky UI implementation
3. Add a `meta.json` file with expected behavior specifications
4. Update the test runner if new validation logic is needed
5. Document the test purpose in this README

## Determinism and Performance

All guardrail tests are designed to be:
- **Deterministic**: Same input always produces same results
- **Fast**: Each test runs in milliseconds
- **Isolated**: Tests don't depend on external resources
- **Repeatable**: Can be run multiple times without side effects

The tests use a mock DOM environment and deterministic scoring algorithms to ensure consistent results across runs.