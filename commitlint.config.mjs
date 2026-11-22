export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 日本語や固有名詞（ADR, Skills, Documents等）が先頭に来るケースを許容
    'subject-case': [0],
  },
};
