const RULE_SEPARATOR = /[;\n\r]+/

export const parseDomainRules = (text: string): DomainRule[] => {
  if (!text?.trim()) return []
  const rules: DomainRule[] = []
  const lines = text.split(RULE_SEPARATOR)
  for (const line of lines) {
    const cleaned = line.replace(/#.*$/, '').trim()
    if (!cleaned) continue
    const raw = cleaned.startsWith('-') ? cleaned.slice(1).trim() : cleaned
    const [typeRaw, valueRaw] = raw.split(',').map((item) => item.trim())
    if (!typeRaw || !valueRaw) continue
    const type = typeRaw.toUpperCase() as DomainRuleType
    if (!['DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'DOMAIN'].includes(type)) continue
    rules.push({
      type,
      value: valueRaw,
      raw: cleaned,
    })
  }
  return rules
}

export const matchDomainRules = (rules: DomainRule[], host: string): boolean => {
  if (!rules?.length || !host) return false
  return rules.some((rule) => {
    switch (rule.type) {
      case 'DOMAIN':
        return host === rule.value
      case 'DOMAIN-KEYWORD':
        return host.includes(rule.value)
      case 'DOMAIN-SUFFIX':
        return host === rule.value || host.endsWith(`.${rule.value}`)
      default:
        return false
    }
  })
}
