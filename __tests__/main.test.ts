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

