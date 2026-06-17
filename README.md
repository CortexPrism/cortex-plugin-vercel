# cortex-plugin-vercel

Deploy frontend apps and serverless functions to Vercel and Netlify.

## Installation

```bash
cortex plugin install marketplace:cortex-plugin-vercel
cortex plugin install github:CortexPrism/cortex-plugin-vercel
cortex plugin install ./manifest.json
```

## Quick Start

```bash
cortex tools list
cortex chat --plugin cortex-plugin-vercel
```

## Tools

### vercel_deploy — Deploy project to Vercel

- `project_path` (string, required)
- `environment` (enum: production/preview/development, preview)
- `env_vars` (string, JSON)
- `build_command` (string)

### vercel_list_deployments — List deployments

- `project` (string)
- `limit` (number, 20)

### vercel_rollback — Rollback a deployment

- `deployment_id` (string, required)

### vercel_get_domains — List domains

- `project` (string)

### vercel_list_env_vars — List env vars

- `project` (string, required)
- `environment` (string)

## Configuration

```json
{
  "plugins": {
    "cortex-plugin-vercel": {
      "enabled": true,
      "config": {
        "vercelToken": "",
        "vercelTeamId": "",
        "vercelDefaultProject": "",
        "netlifyToken": "",
        "netlifyDefaultSite": ""
      }
    }
  }
}
```

## Development

```bash
deno task test
deno task lint
deno task validate
```

## License

MIT
