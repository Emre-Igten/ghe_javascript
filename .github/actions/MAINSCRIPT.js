const fs = require('fs');
const yaml = require('js-yaml');

// Read the parameters from the YAML file
const parameters = yaml.load(fs.readFileSync('.github/actions/parameters.yaml', 'utf8'));

//
const settingsForRepos = parameters.settingsForRepos;

// Import Octokit
const { Octokit } = require("@octokit/core");
const octokit = new Octokit();

let teamCreated = false; // Variabele to check if team is already made

// Function to create the repository's
async function createRepos(settingsForRepos) {
    try {
        for (const repo of settingsForRepos) {
            // call needed functions
            await createRepo(repo.org, repo.name, repo.description, repo.is_private, repo.has_issues, repo.has_projects, repo.has_wiki);
            await makeFile(repo.org, repo.name); 
            if (!teamCreated) { // Check if team already exists
                await createTEAM(repo.org, parameters.teamname, parameters.teamdescription, parameters.teampermission, parameters.teamnotifications, parameters.teamprivacy);
                teamCreated = true; // If team is made, change variable to true
            }
            await enableAlerts(repo.org, repo.name);
            await createRepoRuleset(repo.org, repo.name, repo.rulename, repo.branch, repo.commit_message_pattern_operator, repo.commit_message_pattern, repo.rule_type, repo.rule_target, repo.rule_enforcement);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Functie to create a repository
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

// Function to create a file, serves as first commit
async function makeFile(org, reponame) {
    try {
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: org,
            repo: reponame,
            path: 'README.md',
            message: 'first commit',
            committer: {
                name: 'Emre Igten',
                email: 'emre.igten@delaware.pro'
            },
            content: 'bXkgbmV3IGZpbGUgY29udGVudHM=',
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        console.log("Created first file");

    } catch (error) {
        console.error("Error:", error);

    }

}

// Function to enable alerts
async function enableAlerts(org, reponame) {
    try {
        await octokit.request('PUT /repos/{owner}/{repo}/vulnerability-alerts', {
            owner: org,
            repo: reponame,
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        console.log("Enabled Alerts");
        
    } catch (error) {
        console.error("Error:", error);

    }

}

// Functie om een team te maken
async function createTEAM(org, teamname, teamdescription, teampermission, teamnotifications, teamprivacy) {
    try {
        await octokit.request('POST /orgs/{org}/teams', {
            org: org,
            name: teamname,
            description: teamdescription,
            permission: teampermission,
            notification_setting: teamnotifications,
            privacy: teamprivacy,
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        console.log("Created team");
        // Andere acties die moeten worden uitgevoerd na het maken van een team
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to create a ruleset
async function createRepoRuleset(org, reponame, rulename, branch, commit_message_pattern_operator, commit_message_pattern, rule_type, rule_target, rule_enforcement) {
    try {
        await octokit.request('POST /repos/{owner}/{repo}/rulesets', {
            owner: org,
            repo: reponame,
            name: rulename,
            target: rule_target,
            enforcement: rule_enforcement,
            conditions: {
                ref_name: {
                    include: [
                        `refs/heads/${branch}`
                    ],
                    exclude: [
                        `refs/heads/${branch}/*`
                    ]
                }
            },
            rules: [
                {
                    type: rule_type,
                    parameters: {
                        operator: commit_message_pattern_operator,
                        pattern: commit_message_pattern
                    }
                }
            ],
            headers: {
                authorization: `token ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        console.log("Created ruleset");
    } catch (error) {
        console.error("Error:", error);
    }
}

// Call the function createRepos
createRepos(settingsForRepos);
