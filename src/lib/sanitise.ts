import sanitizeHtml from 'sanitize-html'

/**
 * Sanitises raw HTML for safe storage in the database and rendering.
 * Removes script, iframe, object, embed tags and all on* event handlers.
 */
export function sanitiseHtml(raw: string): string {
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter(
      (tag) => !['script', 'iframe', 'object', 'embed'].includes(tag)
    ),
    allowedAttributes: {
      // Allow common attributes but strip all event handlers
      '*': ['class', 'id', 'style', 'lang', 'dir'],
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      ol: ['start', 'type'],
      li: ['value'],
    },
    // Explicitly disallow all on* event handlers
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    // Strip disallowed tags entirely (don't keep their content for dangerous tags)
    disallowedTagsMode: 'discard',
    // Remove all on* attributes
    allowedClasses: {},
    transformTags: {
      // Ensure external links are safe
      a: (tagName, attribs) => {
        const href = attribs.href ?? ''
        const isExternal = href.startsWith('http') && !href.includes('reddyexchgaming.com')
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        }
      },
    },
  })
}
