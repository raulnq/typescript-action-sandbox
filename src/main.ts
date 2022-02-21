/* eslint-disable sort-imports */
import * as core from '@actions/core'
import * as utils from './utils'
import toSemver from 'to-semver'
import {context, getOctokit} from '@actions/github'
import {
  getWorkingBaseAndType,
  getBranches,
  fetch
} from './create-or-update-branch'

import {GitCommandManager} from './git-command-manager'

const octokit = getOctokit(core.getInput('github_token'))

async function merge(branch: string, to: string): Promise<string> {
  core.info(`merge branch:${branch} to: ${to}`)
  const response = await octokit.rest.repos.merge({
    ...context.repo,
    base: to,
    head: branch
  })
  const newMasterSha = response.data.sha
  core.info(`sha = ${newMasterSha}`)
  return newMasterSha
}

export async function run(): Promise<void> {
  try {
    const repoPath = utils.getRepoPath()
    const git = await GitCommandManager.create(repoPath)
    const [owner, repo] = utils.getOwner()
    core.info(`owner: ${owner} repo: ${repo}`)
    const [currentBranch] = await getWorkingBaseAndType(git)
    if (currentBranch.includes('release')) {
      await git.config('user.email', 'raulnq@gmail.com', true)
      await git.config('user.name', 'raul', true)
      await fetch(git)
      const branches = await getBranches(git, 'release')
      const nextBranch = getNextBranch(branches, currentBranch)
      try {
        const newMasterSha = await merge(currentBranch, nextBranch)
        core.info(`new sha ${newMasterSha}`)
      } catch (error) {
        if (error instanceof Error)
          core.info(`${nextBranch} merge failed:${error.message}`)

        const {data: currentPulls} = await octokit.rest.pulls.list({
          owner,
          repo
        })

        const currentPull = currentPulls.find(pull => {
          return pull.head.ref === currentBranch && pull.base.ref === nextBranch
        })

        if (!currentPull) {
          const {data: response} = await octokit.rest.repos.compareCommits({
            owner,
            repo,
            base: nextBranch,
            head: currentBranch,
            page: 1,
            per_page: 1
          })

          const hasContentDifference =
            response.files !== undefined && response.files.length > 0

          core.info(`hasContentDifference ${hasContentDifference}`)

          if (hasContentDifference) {
            const {data: pullRequest} = await octokit.rest.pulls.create({
              owner,
              repo,
              head: currentBranch,
              base: nextBranch,
              title: `sync: ${currentBranch} to ${nextBranch}`,
              body: `sync-branches: New code has just landed in ${currentBranch}, so let's bring ${nextBranch} up to speed!`,
              draft: false
            })
            /*if (reviewers.length > 0) {
              octokit.rest.pulls.requestReviewers({
                owner,
                repo,
                pull_number: pullRequest.number,
                reviewers
              })
            }*/
            core.info(
              `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.url}`
            )
          } else {
            core.info(
              `There is no content difference between ${currentBranch} and ${nextBranch}.`
            )
          }
        } else {
          core.info(
            `There is already a pull request (${currentPull.number}) to ${currentBranch} from ${nextBranch}. You can view it here: ${currentPull.url}`
          )
        }
      }
      core.setOutput('from-branch', currentBranch)
      core.setOutput('to-branch', nextBranch)
    } else {
      core.info(`The branch ${currentBranch} is not a release branch`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export function getNextBranch(
  branches: string[],
  currentBranch: string
): string {
  const versions: string[] = toSemver(branches)
  let nextBranch = ''
  const reversedVersions = versions.reverse()
  let nextVersionIndex = -1
  for (let index = 0; index < reversedVersions.length; index++) {
    const version = reversedVersions[index]
    if (currentBranch.includes(version)) {
      nextVersionIndex = index + 1
      break
    }
  }

  if (nextVersionIndex < reversedVersions.length && nextVersionIndex !== -1) {
    const nextVersion = reversedVersions[nextVersionIndex]
    for (const branch of branches) {
      if (branch.includes(nextVersion)) {
        nextBranch = branch.replace('origin/', '')
        break
      }
    }
  } else {
    nextBranch = 'develop'
  }

  return nextBranch
}

run()
