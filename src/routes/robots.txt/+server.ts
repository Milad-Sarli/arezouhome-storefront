/** robots.txt served dynamically so the Sitemap URL always matches the origin. */
export async function GET({ url }: { url: URL }): Promise<Response> {
	const body = [
		`User-agent: *`,
		`Allow: /`,
		``,
		`User-agent: GPTBot`,
		`Allow: /`,
		`User-agent: ChatGPT-User`,
		`Allow: /`,
		`User-agent: ClaudeBot`,
		`Allow: /`,
		`User-agent: PerplexityBot`,
		`Allow: /`,
		``,
		`# AI agent discovery files`,
		`Allow: /llms.txt`,
		`Allow: /ai.txt`,
		``,
		`Sitemap: ${url.origin}/sitemap.xml`,
		``,
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
