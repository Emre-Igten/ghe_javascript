const fs = require('fs');
const yaml = require('js-yaml');

// Import Octokit
const { Octokit } = require('@octokit/core');
const octokit = new Octokit();

// Function to create a repository
async function createRepo(org, name, description, isPrivate, hasIssues, hasProjects, hasWiki) {
  try {
    await octokit.request('POST /orgs/{org}/repos', {
      org: org,
      name: name,
      description: description,
      private: isPrivate,
      has_issues: hasIssues,
      has_projects: hasProjects,
      has_wiki: hasWiki,
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log(`Created repository ${name}`);
  } catch (error) {
    console.error(`Error creating repository ${name}:`, error);
  }
}

createRepo('DLW-TEST-EMRE', 'repo1', 'Description for repo1', true, true, false, true);
