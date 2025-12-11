export const SIE = {
  async execute({ pid, contextId, pageId, action }: any) {
    return { ok: true, pid, contextId, pageId, action, result: `[ts-sandbox] ${action?.type}` };
  }
};
