/* eslint-disable sort-imports */
import * as core from '@actions/core'
import semverRegex from 'semver-regex'
import * as utils from './utils'
import toSemver from 'to-semver'
import {
  getWorkingBaseAndType,
  getBranches,
  fetch
} from './create-or-update-branch'
import {GitCommandManager} from './git-command-manager'

export async function run(): Promise<void> {
  try {
    const repoPath = utils.getRepoPath()
    const git = await GitCommandManager.create(repoPath)
    core.startGroup('Checking the base repository state')
    const [workingBase, workingBaseType] = await getWorkingBaseAndType(git)
    core.info(`Working base is ${workingBaseType} '${workingBase}'!!`)
    await fetch(git)
    const branches = await getBranches(git, 'release')
    const sortedBranches: string[] = toSemver(branches)
    core.info('List of branches in order')
    for (const branch of sortedBranches.reverse()) {
      core.info(`branch: ${branch}'`)
    }
    core.endGroup()

    core.setOutput('from-branch', workingBaseType)
    core.setOutput('to-branch', workingBase)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
