/* eslint-disable sort-imports */
import * as core from '@actions/core'
import * as utils from './utils'
import {
  getWorkingBaseAndType,
  getAllBranches,
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
    core.info('fetching')
    const branches = await getAllBranches(git)
    for (const branch of branches) {
      core.info(branch)
    }
    core.endGroup()

    core.setOutput('from-branch', workingBaseType)
    core.setOutput('to-branch', workingBase)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
