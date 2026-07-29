import 'jest-extended';
import nock from 'nock';
import path from 'path';
import { configFixture } from './shared';

describe('PR Branch Labeler', () => {
  let main;

  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate();
    }
    nock.disableNetConnect();
  });

  beforeEach(() => {
    const repoToken = 'token';
    process.env['INPUT_REPO-TOKEN'] = repoToken;
    process.env['GITHUB_REPOSITORY'] = 'Codertocat/Hello-World';
    process.env['GITHUB_EVENT_PATH'] = path.join(__dirname, 'fixtures', 'payload.json');

    main = require('../src/main');
  });

  afterEach(() => {
    console.log('Active Nock Mocks', nock.activeMocks());
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
  });

  it('succeeds', async () => {
    // Arrange
    const getConfigScope = nock('https://api.github.com')
      .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
      .query({ ref: main.context.payload.pull_request.head.sha })
      .reply(200, configFixture());

    const postLabelsScope = nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/42/labels')
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture(
      'feature/FOO-42-awesome-stuff',
      'master',
      main.context.payload.pull_request.head.sha,
    );
    try {
      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(2);
    } catch (error: unknown) {
      console.error(error);
    }
  });

  describe('shorthand string', () => {
    it("adds the 'feature' label for 'feature/FOO-42-awesome-stuff' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['feature'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'feature/FOO-42-awesome-stuff',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });
  });

  describe('shorthand array', () => {
    it("adds the 'support' label for 'support/FOO-42-assisting' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['support'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'support/FOO-42-assisting',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });
  });

  describe('Regular head and base usage', () => {
    it("adds the 'bugfix' label for 'bugfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['bugfix'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'bugfix/FOO-42-squash-bugs',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the 'bugfix' label for 'hotfix/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['bugfix'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'hotfix/FOO-42-squash-bugs',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the 'release' and 'fix' labels for 'bugfix/FOO-42-changes' to 'release/1.0.0'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['bugfix', 'release']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'bugfix/FOO-42-changes',
        'release/1.0.0',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the '🧩 Subtask' label for 'feature/FOO-42-part' to 'feature/FOO-42-whole'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['feature', '🧩 Subtask']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'feature/FOO-42-part',
        'feature/FOO-42-whole',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });
  });

  describe('Regular headRegExp and baseRegExp usage', () => {
    it("adds the 'bugfixregex' label for 'bugfix-regex/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['bugfixregex'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'bugfix-regex/FOO-42-squash-bugs',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the 'bugfixregex' label for 'hotfix-regex/FOO-42-squash-bugs' to 'master'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body).toMatchObject({
            labels: ['bugfixregex'],
          });
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'hotfix-regex/FOO-42-squash-bugs',
        'master',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the 'releaseregex' and 'fixregex' labels for 'bugfix-regex/FOO-42-changes' to 'release-regex/1.0.0'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['bugfixregex', 'releaseregex']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'bugfix-regex/FOO-42-changes',
        'release-regex/1.0.0',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the '🧩 Subtaskregex' label for 'feature-regex/FOO-42-part' to 'feature-regex/FOO-42-whole'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['🧩 Subtaskregex']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'feature-regex/FOO-42-part',
        'feature-regex/FOO-42-whole',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the '1.0.0' label for 'feature-regex/FOO-42-part' to 'release-regexp/1.0.0'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['1.0.0']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'feature-regex/FOO-42-part',
        'release-regexp/1.0.0',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });

    it("adds the 'sprint10' label for 'feature-regex/FOO-42-part' to 'sprint-regexp/10'", async () => {
      // Arrange
      const getConfigScope = nock('https://api.github.com')
        .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
        .query({ ref: main.context.payload.pull_request.head.sha })
        .reply(200, configFixture());

      const postLabelsScope = nock('https://api.github.com')
        .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
          expect(body.labels).toIncludeAllMembers(['sprint10']);
          return true;
        })
        .reply(200);

      main.context.payload = createPullRequestOpenedFixture(
        'feature-regex/FOO-42-part',
        'sprint-regexp/10',
        main.context.payload.pull_request.head.sha,
      );

      // Act
      await main.run();

      // Assert
      expect(getConfigScope.isDone()).toBe(true);
      expect(postLabelsScope.isDone()).toBe(true);
      expect.assertions(3);
    });
  });

  it('uses the default config when no config was provided', async () => {
    // Arrange
    const getConfigScope = nock('https://api.github.com')
      .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
      .query({ ref: main.context.payload.pull_request.head.sha })
      .reply(404);

    const postLabelsScope = nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
        expect(body).toMatchObject({
          labels: ['feature'],
        });
        return true;
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture(
      'feature/FOO-42-awesome-stuff',
      'master',
      main.context.payload.pull_request.head.sha,
    );

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBe(true);
    expect(postLabelsScope.isDone()).toBe(true);
    expect.assertions(3);
  });

  it("adds no labels if the branch doesn't match any patterns", async () => {
    // Arrange
    const getConfigScope = nock('https://api.github.com')
      .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
      .query({ ref: main.context.payload.pull_request.head.sha })
      .reply(200, configFixture());

    const postLabelsScope = nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/42/labels', () => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    main.context.payload = createPullRequestOpenedFixture(
      'fix-the-build',
      'master',
      main.context.payload.pull_request.head.sha,
    );

    // Act
    await main.run();

    // Assert
    expect(getConfigScope.isDone()).toBe(true);
    expect(postLabelsScope.isDone()).toBe(false);
    expect.assertions(2);
  });

  it('throws an error when the provided config is invalid', async () => {
    // Arrange
    const getConfigScope = nock('https://api.github.com')
      .get(`/repos/Codertocat/Hello-World/contents/.github%2Fpr-branch-labeler.yml`)
      .query({ ref: main.context.payload.pull_request.head.sha })
      .reply(200, configFixture('invalid-config.yml'));

    const postLabelsScope = nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/42/labels', body => {
        throw new Error("Shouldn't add labels");
      })
      .reply(200);

    console.log('active mocks', nock.activeMocks());

    main.context.payload = createPullRequestOpenedFixture(
      'feature/FOO-42-awesome-stuff',
      'master',
      main.context.payload.pull_request.head.sha,
    );

    // Act
    await expect(main.run()).rejects.toThrow(new Error('config.yml has invalid structure.'));

    // Assert
    expect(getConfigScope.isDone()).toBe(true);
    expect(postLabelsScope.isDone()).toBe(false);
    expect.assertions(3);
  });
});

function createPullRequestOpenedFixture(headRef: string, baseRef: string, sha: string) {
  return {
    action: 'opened',
    pull_request: {
      number: 42,
      head: {
        ref: headRef,
        sha,
      },
      base: {
        ref: baseRef,
      },
    },
    repository: {
      name: 'Hello-World',
      owner: {
        login: 'Codertocat',
      },
    },
  };
}
