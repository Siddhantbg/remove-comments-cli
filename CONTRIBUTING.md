# Contributing to remove-comments-cli

Thank you for your interest in contributing to remove-comments-cli! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/siddhantbg/remove-comments-cli.git
   cd remove-comments-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure:
   - All tests pass: `npm test`
   - Code is linted: `npm run lint`
   - Code is formatted: `npm run format`
   - TypeScript compiles: `npm run build`

3. Write or update tests for your changes

4. Update documentation if needed:
   - README.md for user-facing changes
   - Code comments for technical details
   - Docusaurus docs for detailed guides

## Code Style Guide

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write descriptive commit messages
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Use meaningful variable names

## Pull Request Process

1. Update the README.md with details of major changes
2. Update the version number following [SemVer](https://semver.org/)
3. Include tests for new functionality
4. Ensure the test suite passes
5. Update documentation

### PR Title Format
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- test: Test updates
- chore: Routine tasks, maintenance

### PR Description Template
```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
[Describe test cases]

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Issue Guidelines

### Bug Reports
- Use the bug report template
- Include Node.js version and OS
- Provide minimal reproduction steps
- Include error messages and stack traces

### Feature Requests
- Use the feature request template
- Explain the use case
- Describe expected behavior
- Provide example usage

## Documentation

- Keep README.md user-focused
- Update Docusaurus docs for detailed guides
- Include code examples
- Document edge cases and limitations

## Testing

- Write unit tests for new features
- Include edge cases in tests
- Maintain or improve code coverage
- Test cross-platform compatibility

## Questions or Problems?

- Check existing issues and documentation
- Open a new issue if needed
- Join our discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License. 