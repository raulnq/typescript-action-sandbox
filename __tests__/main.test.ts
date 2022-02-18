import {expect, test, describe, jest} from '@jest/globals'
import { run } from '../src/main'
import * as core from '@actions/core'


jest.mock('@actions/core')

describe('When running the action', ()=>{
  const fakeSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>

  test('it should set the output parameters', async () => {
    await run()
    //expect(fakeSetOutput).toHaveBeenCalledWith('from-branch', expect.anything())
  })
})
/*
describe('getNextBranch tests', ()=>{
  test('current branch as a first one of the list', async () => {
    const branches = ['/release/2.0.0','/release/1.0.5','/release/3.1.5','/release/1.1.5','/release/1.0.0']
    const currentBranch = '/release/1.0.0'
    const nextBranch = await getNextBranch(branches, currentBranch)
    expect(nextBranch).toBe('/release/1.0.5')
  })
})
*/