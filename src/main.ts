import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    core.setOutput('from-branch', '1.0.0')
    core.setOutput('to-branch', '2.0.0')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
