// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { tools } from '../../mod.ts';
import type { PluginContext, ToolContext } from '../../types.ts';

// Mock PluginContext
const mockContext: PluginContext & ToolContext = {
  pluginId: 'cortex-plugin-vercel',
  pluginDir: '/tmp/plugins/cortex-plugin-vercel',
  state: {
    get: async () => null,
    set: async () => {},
    delete: async () => {},
    list: async () => ({}),
  },
  config: {
    get: async () => null,
    set: async () => {},
    getAll: async () => ({}),
  },
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  },
  host: {
    registerTool: () => {},
    unregisterTool: () => {},
  },
  sessionId: 'test-session',
  workingDir: '/tmp',
  agentId: 'test-agent',
  workspaceDir: '/tmp',
};

function findTool(name: string) {
  const tool = tools.find((t) => t.definition.name === name);
  if (!tool) throw new Error(`Tool "${name}" not found`);
  return tool;
}

Deno.test('tools array — exports all tools', () => {
  assertEquals(tools.length, 4);
  assertEquals(tools[0].definition.name, 'vercel_deploy');
  assertEquals(tools[1].definition.name, 'vercel_list_deployments');
  assertEquals(tools[2].definition.name, 'vercel_rollback');
  assertEquals(tools[3].definition.name, 'vercel_get_domains');
});

Deno.test('vercel_deploy — rejects empty project_path', async () => {
  const tool = findTool('vercel_deploy');
  const result = await tool.execute({ 'project_path': '' }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error ?? '', 'non-empty string');
});

Deno.test('vercel_list_deployments — tool is defined with name and description', () => {
  const tool = findTool('vercel_list_deployments');
  assertEquals(typeof tool.definition.description, 'string');
  assertEquals(tool.definition.description.length > 0, true);
});

Deno.test('vercel_rollback — rejects empty deployment_id', async () => {
  const tool = findTool('vercel_rollback');
  const result = await tool.execute({ 'deployment_id': '' }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error ?? '', 'non-empty string');
});

Deno.test('vercel_get_domains — tool is defined with name and description', () => {
  const tool = findTool('vercel_get_domains');
  assertEquals(typeof tool.definition.description, 'string');
  assertEquals(tool.definition.description.length > 0, true);
});

Deno.test('all tools return durationMs', async () => {
  for (const tool of tools) {
    const args: Record<string, unknown> = {};
    const result = await tool.execute(args, mockContext);
    assertEquals(typeof result.durationMs, 'number');
    assertEquals(result.durationMs >= 0, true);
  }
});
