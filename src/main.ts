/* eslint-disable sort-imports */
import * as core from '@actions/core'
import * as utils from './utils'
import toSemver from 'to-semver'
import {
  getWorkingBaseAndType,
  getBranches,
  merge,
  fetch
} from './create-or-update-branch'
import {GitCommandManager} from './git-command-manager'

export async function run(): Promise<void> {
  try {
    const repoPath = utils.getRepoPath()
    const git = await GitCommandManager.create(repoPath)
    const [currentBranch] = await getWorkingBaseAndType(git)
    if (currentBranch.includes('release')) {
      await git.config('user.email', 'raulnq@gmail.com', true)
      await git.config('user.name', 'raul', true)
      await fetch(git)
      const branches = await getBranches(git, 'release')
      const nextBranch = getNextBranch(branches, currentBranch)
      await git.checkout(nextBranch)
      await merge(git, currentBranch)
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
