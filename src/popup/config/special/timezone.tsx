import { useStorageStore } from "@/popup/stores/storage"
import TipIcon from "@/components/data/tip-icon"
import Markdown from "react-markdown"
import { useEffect, useMemo, useRef, useState } from "react"
import { App, Button, Form, Select, Spin, Tag, Typography } from "antd"
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons'
import { ConfigItemY } from "../item"
import { selectStatusDotStyles as dotStyles } from "../styles"
import { sharedAsync } from "@/utils/timer"
import { LocalApi, type TimeZoneOption } from "@/api/local"
import { useI18n } from "@/utils/hooks"
import { parseDomainRules } from "@/utils/domain-rule"

const fetchTimezones = sharedAsync(LocalApi.timezone)

const getDefaultRuleConfig = (): TimeZoneRuleConfig => ({
  rulesText: '',
  rules: [],
  match: null,
  fallback: null,
})

const getPresetKey = (tz: TimeZoneInfo | null, presets: TimeZoneOption[]) => {
  if (!tz) return 'system'
  const preset = presets.find((item) => (
    item.zone === tz.zone && item.locale === tz.locale && item.offset === tz.offset
  ))
  return preset?.key ?? 'custom'
}

const toTimezoneInfo = (preset: TimeZoneOption): TimeZoneInfo => ({
  zone: preset.zone,
  locale: preset.locale,
  offset: preset.offset,
})

export const TimeZoneConfigItem = () => {
  const config = useStorageStore((state) => state.config)
  const fp = config?.fp

  const { message } = App.useApp()
  const { t, i18n, asLang } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [localPreset, setLocalPreset] = useState<TimeZoneOption[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || localPreset.length != 0) return
    fetchTimezones()
      .then(setLocalPreset)
      .catch((e) => {
        console.warn(e)
      })
  }, [isOpen])

  useEffect(() => {
    if (!fp?.other.timezoneRule) {
      fp!.other.timezoneRule = getDefaultRuleConfig()
    }
  }, [fp])

  const ruleConfig = fp?.other.timezoneRule ?? getDefaultRuleConfig()
  const ruleCount = ruleConfig.rules?.length ?? 0

  const options = useMemo(() => {
    const base = [
      {
        value: 'system',
        label: t('label.tz.system'),
      },
      ...localPreset.map((tz) => ({
        value: tz.key,
        label: `(${tz.offset >= 0 ? '+' : ''}${tz.offset}) ${asLang(tz.title)}`,
      })),
    ]
    return base
  }, [i18n.language, localPreset])

  const matchKey = getPresetKey(ruleConfig.match, localPreset)
  const fallbackKey = getPresetKey(ruleConfig.fallback, localPreset)

  const extraOption = useMemo(() => {
    const extra: { value: string; label: string }[] = []
    if (matchKey === 'custom') {
      extra.push({
        value: 'custom',
        label: t('label.tz.custom'),
      })
    }
    if (fallbackKey === 'custom' && matchKey !== 'custom') {
      extra.push({
        value: 'custom',
        label: t('label.tz.custom'),
      })
    }
    return extra
  }, [matchKey, fallbackKey, i18n.language])

  const handleSelect = (value: string, type: 'match' | 'fallback') => {
    if (value === 'system') {
      ruleConfig[type] = null
      return
    }
    if (value === 'custom') {
      return
    }
    const preset = localPreset.find((item) => item.key === value)
    if (preset) {
      ruleConfig[type] = toTimezoneInfo(preset)
    }
  }

  const applyRulesText = (text: string) => {
    ruleConfig.rulesText = text
    ruleConfig.rules = parseDomainRules(text)
  }

  const handleImport = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      applyRulesText(text)
      message.success(t('tip.ok.rule-import'))
    }
    reader.onerror = () => {
      message.warning(t('tip.err.rule-import'))
    }
    reader.readAsText(file)
  }

  if (!fp) {
    return <Spin indicator={<LoadingOutlined spin />} />
  }

  return (
    <ConfigItemY
      label={t('item.title.timezone')}
      className={ruleCount > 0 ? dotStyles.success : ''}
      endContent={<TipIcon.Question content={<Markdown>{t('item.desc.timezone')}</Markdown>} />}
    >
      <Form.Item label={t('item.sub.tz.rules')}>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.list,.rules"
            className="hidden"
            onChange={(event) => {
              handleImport(event.target.files)
              event.target.value = ''
            }}
          />
          <Button icon={<UploadOutlined />} onClick={() => fileRef.current?.click()}>
            {t('label.tz.import')}
          </Button>
          {ruleCount > 0 ? (
            <Tag color="green">{t('label.tz.rule-count', { count: ruleCount })}</Tag>
          ) : (
            <Typography.Text type="secondary">{t('label.tz.no-rules')}</Typography.Text>
          )}
        </div>
      </Form.Item>

      <Form.Item label={t('item.sub.tz.match')}>
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          className={dotStyles.base}
          options={[...options, ...extraOption]}
          value={matchKey}
          onChange={(value) => handleSelect(value, 'match')}
        />
      </Form.Item>

      <Form.Item label={t('item.sub.tz.fallback')}>
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          className={dotStyles.base}
          options={[...options, ...extraOption]}
          value={fallbackKey}
          onChange={(value) => handleSelect(value, 'fallback')}
        />
      </Form.Item>
    </ConfigItemY>
  )
}

export default TimeZoneConfigItem
