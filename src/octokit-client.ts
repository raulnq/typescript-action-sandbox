/* eslint-disable import/named */
/* eslint-disable import/no-unresolved */
/* eslint-disable sort-imports */
import {HttpsProxyAgent} from 'https-proxy-agent'
import {Octokit as Core} from '@octokit/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'
import {restEndpointMethods} from '@octokit/plugin-rest-endpoint-methods'

export {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods'
export {OctokitOptions} from '@octokit/core/dist-types/types'

export const Octokit = Core.plugin(
  paginateRest,
  restEndpointMethods,
  autoProxyAgent
)

// Octokit plugin to support the https_proxy environment variable
function autoProxyAgent(octokit: Core): void {
  const proxy = process.env.https_proxy || process.env.HTTPS_PROXY
  if (!proxy) return

  const agent = new HttpsProxyAgent(proxy)
  octokit.hook.before('request', options => {
    options.request.agent = agent
  })
}
