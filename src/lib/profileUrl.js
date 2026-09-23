export function parseProfileUrl(value) {
    try {
        const url = new URL(value.trim());
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        const parts = url.pathname.split('/').filter(Boolean);
        if (host === 'linkedin.com' && parts.length === 2 && parts[0] === 'in') {
            return { provider: 'LinkedIn', username: decodeURIComponent(parts[1]), href: url.href };
        }
        if (host === 'github.com' && parts.length === 1 && /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(parts[0])) {
            return { provider: 'GitHub', username: parts[0], href: url.href };
        }
    } catch { /* Keep invalid or incomplete values editable. */ }
    return null;
}
