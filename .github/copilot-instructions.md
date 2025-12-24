# GitHub Copilot Instructions

## Code Quality Standards

Before suggesting code changes or completing implementations, ensure:

1. Run Ultimate Bug Scanner: `ubs --fail-on-warning .`
2. Fix any critical issues found
3. Address warnings when possible
4. Follow the bug patterns detected by UBS

## Workflow

- After generating significant code (>50 lines), recommend running: `ubs .`
- For security-sensitive code, always run scanner before commit
- Reference UBS findings in code review comments

## Integration

UBS detects 1000+ bug patterns across JavaScript/TypeScript, Python, C/C++, Rust, Go, Java, and Ruby.
