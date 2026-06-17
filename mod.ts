import type { PluginContext, Tool, ToolCallResult, ToolContext } from './types.ts';

let config: Record<string, string | boolean> = {};

export async function onLoad(ctx: PluginContext): Promise<void> {
  config = {
    vercelToken: (await ctx.config.get('vercelToken')) ?? '',
    vercelTeamId: (await ctx.config.get('vercelTeamId')) ?? '',
    vercelDefaultProject: (await ctx.config.get('vercelDefaultProject')) ?? '',
    netlifyToken: (await ctx.config.get('netlifyToken')) ?? '',
    netlifyDefaultSite: (await ctx.config.get('netlifyDefaultSite')) ?? '',
  };
}

export async function onUnload(_ctx: PluginContext): Promise<void> {}

const vercel_deploy: Tool = {
  definition: {
    name: 'vercel_deploy',
    description: 'Deploy project to Vercel',
    params: [
      {
        name: 'project_path',
        type: 'string',
        description: 'Path to project directory',
        required: true,
      },
      {
        name: 'environment',
        type: 'string',
        description: 'Deployment environment',
        required: false,
      },
      {
        name: 'env_vars',
        type: 'string',
        description: 'Environment variables as JSON',
        required: false,
      },
      {
        name: 'build_command',
        type: 'string',
        description: 'Custom build command',
        required: false,
      },
    ],
    capabilities: ['shell:run', 'network:fetch'],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const projectPath = args.project_path as string;
      if (!projectPath) {
        return {
          toolName: 'vercel_deploy',
          success: false,
          output: '',
          error: 'project_path is required',
          durationMs: Date.now() - start,
        };
      }
      const envArg = (args.environment as string) ?? 'preview';
      const validEnvs = ['production', 'preview', 'development'];
      if (!validEnvs.includes(envArg)) {
        return {
          toolName: 'vercel_deploy',
          success: false,
          output: '',
          error: `Invalid environment: ${envArg}`,
          durationMs: Date.now() - start,
        };
      }
      const cmdArgs = ['deploy'];
      if (envArg !== 'production') cmdArgs.push(`--env`, envArg);
      if (args.build_command) cmdArgs.push('--build-env', `BUILD_COMMAND=${args.build_command}`);
      if (config.vercelToken) cmdArgs.push('--token', config.vercelToken as string);

      const p = new Deno.Command('vercel', { args: cmdArgs, cwd: projectPath });
      const { stdout, stderr } = await p.output();
      const output = new TextDecoder().decode(stdout);
      const err = new TextDecoder().decode(stderr);
      return {
        toolName: 'vercel_deploy',
        success: true,
        output: output || err,
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'vercel_deploy',
        success: false,
        output: '',
        error: `Failed to deploy: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

const vercel_list_deployments: Tool = {
  definition: {
    name: 'vercel_list_deployments',
    description: 'List deployments',
    params: [
      { name: 'project', type: 'string', description: 'Project name filter', required: false },
      { name: 'limit', type: 'number', description: 'Max deployments to show', required: false },
    ],
    capabilities: ['shell:run', 'network:fetch'],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const limit = (args.limit as number) ?? 20;
      const cmdArgs = ['list', '--limit', String(limit)];
      if (config.vercelToken) cmdArgs.push('--token', config.vercelToken as string);

      const p = new Deno.Command('vercel', { args: cmdArgs });
      const { stdout, stderr } = await p.output();
      const output = new TextDecoder().decode(stdout);
      return {
        toolName: 'vercel_list_deployments',
        success: true,
        output: output || 'No deployments found',
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'vercel_list_deployments',
        success: false,
        output: '',
        error: `Failed to list deployments: ${
          error instanceof Error ? error.message : String(error)
        }`,
        durationMs: Date.now() - start,
      };
    }
  },
};

const vercel_rollback: Tool = {
  definition: {
    name: 'vercel_rollback',
    description: 'Rollback a deployment',
    params: [
      {
        name: 'deployment_id',
        type: 'string',
        description: 'Deployment ID to rollback to',
        required: true,
      },
    ],
    capabilities: ['shell:run', 'network:fetch'],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const deploymentId = args.deployment_id as string;
      if (!deploymentId) {
        return {
          toolName: 'vercel_rollback',
          success: false,
          output: '',
          error: 'deployment_id is required',
          durationMs: Date.now() - start,
        };
      }
      const cmdArgs = ['rollback', deploymentId];
      if (config.vercelToken) cmdArgs.push('--token', config.vercelToken as string);

      const p = new Deno.Command('vercel', { args: cmdArgs });
      const { stdout, stderr } = await p.output();
      const output = new TextDecoder().decode(stdout);
      return {
        toolName: 'vercel_rollback',
        success: true,
        output: output || `Rolled back to ${deploymentId}`,
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'vercel_rollback',
        success: false,
        output: '',
        error: `Failed to rollback: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

const vercel_get_domains: Tool = {
  definition: {
    name: 'vercel_get_domains',
    description: 'List domains',
    params: [
      { name: 'project', type: 'string', description: 'Project name filter', required: false },
    ],
    capabilities: ['shell:run', 'network:fetch'],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const cmdArgs = ['domains', 'ls'];
      if (config.vercelToken) cmdArgs.push('--token', config.vercelToken as string);

      const p = new Deno.Command('vercel', { args: cmdArgs });
      const { stdout, stderr } = await p.output();
      const output = new TextDecoder().decode(stdout);
      return {
        toolName: 'vercel_get_domains',
        success: true,
        output: output || 'No domains found',
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'vercel_get_domains',
        success: false,
        output: '',
        error: `Failed to get domains: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

const vercel_list_env_vars: Tool = {
  definition: {
    name: 'vercel_list_env_vars',
    description: 'List environment variables',
    params: [
      { name: 'project', type: 'string', description: 'Project name', required: true },
      { name: 'environment', type: 'string', description: 'Environment filter', required: false },
    ],
    capabilities: ['shell:run', 'network:fetch'],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const project = args.project as string;
      if (!project) {
        return {
          toolName: 'vercel_list_env_vars',
          success: false,
          output: '',
          error: 'project is required',
          durationMs: Date.now() - start,
        };
      }
      const cmdArgs = ['env', 'ls'];
      if (args.environment) cmdArgs.push(args.environment as string);
      if (config.vercelToken) cmdArgs.push('--token', config.vercelToken as string);

      const p = new Deno.Command('vercel', { args: cmdArgs, cwd: project });
      const { stdout } = await p.output();
      const output = new TextDecoder().decode(stdout);
      return {
        toolName: 'vercel_list_env_vars',
        success: true,
        output: output || 'No env vars found',
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'vercel_list_env_vars',
        success: false,
        output: '',
        error: `Failed to list env vars: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

export const tools: Tool[] = [
  vercel_deploy,
  vercel_list_deployments,
  vercel_rollback,
  vercel_get_domains,
  vercel_list_env_vars,
];
