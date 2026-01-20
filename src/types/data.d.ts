type SizeInfo = {
  width: number
  height: number
}

type TimeZoneInfo = {
  offset: number
  zone: string
  locale: string
}

type DomainRuleType = 'DOMAIN-SUFFIX' | 'DOMAIN-KEYWORD' | 'DOMAIN'

type DomainRule = {
  type: DomainRuleType
  value: string
  raw: string
}

type TimeZoneRuleConfig = {
  rulesText: string
  rules: DomainRule[]
  match: TimeZoneInfo | null
  fallback: TimeZoneInfo | null
}

type EquipmentInfo = {
  platform: string
  appVersion: string
  userAgent: string
}

type FullVersion = {
  major: string
  full: string
}

type Brand = {
  brand: string
  version: string
}

type NavigatorUADataAttr = {
  brands: Brand[]
  platform: string
  mobile: boolean
}

type NavigatorUAData = NavigatorUADataAttr & {
  getHighEntropyValues?: (opt?: string[]) => Promise<HighEntropyValuesAttr>
}

type HighEntropyValuesAttr = NavigatorUADataAttr & {
  fullVersionList?: Brand[]
  uaFullVersion?: string
}

type SeededFn<T = any> = (seed: number) => T

type GpuInfo = {
  vendor?: string
  renderer?: string
}

type ScreenSize = {
  width?: number
  height?: number
}

type ScreenDepth = {
  color?: number
  pixel?: number
}

type ClientHintsInfo = {
  ua: {
    userAgent: string
    appVersion: string
    platform: string
  }
  uaData: {
    arch: string
    bitness: string
    mobile: boolean
    model: string
    platform: string
    platformVersion: string
    formFactors: string[]
    uaFullVersion: string
    versions: {
      brand: string
      version: string
    }[]
  }
}

type I18nString = string | Record<string, string>
