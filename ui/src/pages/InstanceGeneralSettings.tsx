import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Check, ChevronsUpDown } from "lucide-react";
import { instanceSettingsApi } from "@/api/instanceSettings";
import {
  SettingsChoiceCard,
  SettingsDivider,
  SettingsPageHeader,
  SettingsRow,
  SettingsToggle,
} from "@/components/settings/SettingsScaffold";
import { SettingsPageSkeleton } from "@/components/settings/SettingsPageSkeleton";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useI18n } from "../context/I18nContext";
import { useTheme } from "../context/ThemeContext";
import { queryKeys } from "../lib/queryKeys";
import { SETTINGS_PREFETCH_STALE_TIME_MS } from "@/lib/settings-prefetch";
import {
  readDesktopShell,
  type DesktopUpdateChannel,
} from "@/lib/desktop-shell";

function FontPreview({ font, label }: { font: string; label: string }) {
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  return (
    <div className="rounded-[calc(var(--radius-md)-4px)] border border-white/8 bg-[color:color-mix(in_oklab,var(--surface-shell)_82%,transparent)] p-3">
      <div className="text-base" style={{ fontFamily: font }}>
        {label}
      </div>
      <input
        type="text"
        value={previewText}
        onChange={(e) => setPreviewText(e.target.value)}
        className="mt-1 w-full bg-transparent text-xs text-muted-foreground outline-none focus:underline"
        style={{ fontFamily: font }}
      />
    </div>
  );
}

function ThemePreview({ mode }: { mode: "light" | "system" | "dark" }) {
  return (
    <div className="grid gap-2">
      <div
        className="h-14 rounded-[calc(var(--radius-md)-4px)] border border-white/8"
        style={{
          background:
            mode === "light"
              ? "linear-gradient(180deg, #f4efe7 0%, #ece6dd 100%)"
              : mode === "dark"
                ? "linear-gradient(180deg, #312c28 0%, #262220 100%)"
                : "linear-gradient(90deg, #f1ece5 0%, #f1ece5 50%, #2b2724 50%, #2b2724 100%)",
        }}
      >
        <div className="flex h-full flex-col justify-between p-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div
                className="h-1.5 w-10 rounded-full"
                style={{ background: mode === "dark" ? "rgb(255 255 255 / 0.28)" : "rgb(50 45 40 / 0.14)" }}
              />
              <div
                className="h-1.5 w-7 rounded-full"
                style={{ background: mode === "dark" ? "rgb(255 255 255 / 0.18)" : "rgb(50 45 40 / 0.10)" }}
              />
            </div>
            <div
              className="rounded-full px-2 py-1"
              style={{ background: mode === "dark" ? "rgb(0 0 0 / 0.38)" : "rgb(255 255 255 / 0.52)" }}
            >
              <div
                className="h-1.5 w-6 rounded-full"
                style={{ background: mode === "dark" ? "rgb(255 255 255 / 0.28)" : "rgb(50 45 40 / 0.14)" }}
              />
            </div>
          </div>
          <div
            className="flex items-center justify-between rounded-[12px] border px-2 py-1.5"
            style={{
              background: mode === "dark" ? "rgb(255 255 255 / 0.10)" : "rgb(255 255 255 / 0.68)",
              borderColor: mode === "dark" ? "rgb(255 255 255 / 0.10)" : "rgb(50 45 40 / 0.08)",
            }}
          >
            <div
              className="h-1.5 w-12 rounded-full"
              style={{ background: mode === "dark" ? "rgb(255 255 255 / 0.20)" : "rgb(50 45 40 / 0.12)" }}
            />
            <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-base)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguagePreview({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="rounded-[calc(var(--radius-md)-4px)] border border-white/8 bg-[color:color-mix(in_oklab,var(--surface-shell)_82%,transparent)] p-3">
        <div className="text-sm font-semibold text-foreground">{primary}</div>
        <div className="mt-1 text-xs text-muted-foreground">{secondary}</div>
      </div>
    </div>
  );
}

export function InstanceGeneralSettings() {
  const { t } = useI18n();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [desktopUpdatesSupported, setDesktopUpdatesSupported] = useState(false);
  const [updateChannel, setUpdateChannel] = useState<DesktopUpdateChannel>("stable");
  const [updateChannelPending, setUpdateChannelPending] = useState(false);
  const { theme, setTheme, fontFamily, fontSizeScale, uiScale, setFontFamily, setFontSizeScale, setUiScale } = useTheme();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemFonts, setSystemFonts] = useState<string[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: t("common.systemSettings") },
      { label: t("common.general") },
    ]);
  }, [setBreadcrumbs, t]);

  // Load system fonts on mount
  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;

    let cancelled = false;

    async function loadSystemFonts() {
      const fonts = await document.fonts.ready;
      if (cancelled) return;

      const fontSet = new Set<string>();
      // Add our preset fonts first
      ["Inter", "system-ui", "JetBrains Sans", "Lexend Deca", "LXGW WenKai Mono", "霞鹜文楷等宽"].forEach(f => fontSet.add(f));

      for (const font of fonts) {
        fontSet.add(font.family);
      }

      const sorted = Array.from(fontSet).sort((a, b) => a.localeCompare(b));
      setSystemFonts(sorted);
    }

    void loadSystemFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  const generalQuery = useQuery({
    queryKey: queryKeys.instance.generalSettings,
    queryFn: () => instanceSettingsApi.getGeneral(),
    staleTime: SETTINGS_PREFETCH_STALE_TIME_MS,
  });

  useEffect(() => {
    const desktopShell = readDesktopShell();
    const supported = Boolean(desktopShell?.getUpdateChannel && desktopShell?.setUpdateChannel);
    setDesktopUpdatesSupported(supported);
    if (!supported || !desktopShell?.getUpdateChannel) return;

    let cancelled = false;
    void desktopShell.getUpdateChannel()
      .then((channel) => {
        if (!cancelled) setUpdateChannel(channel);
      })
      .catch(() => {
        if (!cancelled) {
          setDesktopUpdatesSupported(false);
          setUpdateChannel("stable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMutation = useMutation({
    mutationFn: async (patch: { censorUsernameInLogs?: boolean; showDeveloperDiagnostics?: boolean; locale?: "en" | "zh-CN" }) =>
      instanceSettingsApi.updateGeneral(patch),
    onSuccess: async (nextSettings) => {
      setActionError(null);
      queryClient.setQueryData(queryKeys.instance.generalSettings, nextSettings);
      queryClient.setQueryData(queryKeys.health, (current: { uiLocale?: "en" | "zh-CN" } | undefined) =>
        current ? { ...current, uiLocale: nextSettings.locale } : current,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.instance.generalSettings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      ]);
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : t("general.updateFailed"));
    },
  });

  if (generalQuery.isLoading) {
    return <SettingsPageSkeleton />;
  }

  if (generalQuery.error) {
    return (
      <div className="text-sm text-destructive">
        {generalQuery.error instanceof Error
          ? generalQuery.error.message
          : t("general.loadFailed")}
      </div>
    );
  }

  const censorUsernameInLogs = generalQuery.data?.censorUsernameInLogs === true;
  const showDeveloperDiagnostics = generalQuery.data?.showDeveloperDiagnostics === true;
  const locale = generalQuery.data?.locale ?? "zh-CN";

  async function handleUpdateChannelToggle() {
    const desktopShell = readDesktopShell();
    if (!desktopShell?.setUpdateChannel) {
      setActionError(t("general.updates.unavailable"));
      return;
    }

    const nextChannel: DesktopUpdateChannel = updateChannel === "canary" ? "stable" : "canary";
    setUpdateChannelPending(true);
    try {
      const savedChannel = await desktopShell.setUpdateChannel(nextChannel);
      setUpdateChannel(savedChannel);
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t("general.updates.updateFailed"));
    } finally {
      setUpdateChannelPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 px-1 pb-6">
      <SettingsPageHeader
        icon={SlidersHorizontal}
        title={t("general.title")}
        description={t("general.description")}
      />

      {actionError ? (
        <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <SettingsDivider />

      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">{t("general.language.title")}</div>
        <div className="flex flex-wrap gap-2.5">
          <SettingsChoiceCard
            label={t("general.language.option.en.label")}
            description={t("general.language.option.en.description")}
            selected={locale === "en"}
            onClick={() => toggleMutation.mutate({ locale: "en" })}
            preview={
              <LanguagePreview
                primary={t("general.language.preview.en.primary")}
                secondary={t("general.language.preview.en.secondary")}
              />
            }
          />
          <SettingsChoiceCard
            label={t("general.language.option.zh-CN.label")}
            description={t("general.language.option.zh-CN.description")}
            selected={locale === "zh-CN"}
            onClick={() => toggleMutation.mutate({ locale: "zh-CN" })}
            preview={
              <LanguagePreview
                primary={t("general.language.preview.zh-CN.primary")}
                secondary={t("general.language.preview.zh-CN.secondary")}
              />
            }
          />
        </div>
      </div>

      <SettingsDivider />

      <SettingsRow
        title={t("general.logs.censor.title")}
        description={t("general.logs.censor.description")}
        className="border-t-0 pt-0"
        action={
          <SettingsToggle
            checked={censorUsernameInLogs}
            aria-label="Toggle username log censoring"
            disabled={toggleMutation.isPending}
            onClick={() => toggleMutation.mutate({ censorUsernameInLogs: !censorUsernameInLogs })}
          />
        }
      />

      <SettingsDivider />

      {desktopUpdatesSupported ? (
        <>
          <SettingsRow
            title={t("general.updates.canary.title")}
            description={updateChannel === "canary"
              ? t("general.updates.canary.enabledDescription")
              : t("general.updates.canary.disabledDescription")}
            className="border-t-0 pt-0"
            action={
              <SettingsToggle
                checked={updateChannel === "canary"}
                aria-label="Toggle canary desktop updates"
                disabled={updateChannelPending}
                onClick={() => void handleUpdateChannelToggle()}
              />
            }
          />

          <SettingsDivider />
        </>
      ) : null}

      <SettingsRow
        title={t("general.diagnostics.developer.title")}
        description={t("general.diagnostics.developer.description")}
        className="border-t-0 pt-0"
        action={
          <SettingsToggle
            checked={showDeveloperDiagnostics}
            aria-label="Toggle developer diagnostics"
            disabled={toggleMutation.isPending}
            onClick={() => toggleMutation.mutate({ showDeveloperDiagnostics: !showDeveloperDiagnostics })}
          />
        }
      />

      <SettingsDivider />

      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">{t("general.appearance.colorMode")}</div>
        <div className="flex flex-wrap gap-2.5">
          <SettingsChoiceCard
            label={t("general.appearance.light.label")}
            description={t("general.appearance.light.description")}
            selected={theme === "light"}
            onClick={() => setTheme("light")}
            preview={<ThemePreview mode="light" />}
          />
          <SettingsChoiceCard
            label={t("general.appearance.system.label")}
            description={t("general.appearance.system.description")}
            selected={theme === "system"}
            onClick={() => setTheme("system")}
            preview={<ThemePreview mode="system" />}
          />
          <SettingsChoiceCard
            label={t("general.appearance.dark.label")}
            description={t("general.appearance.dark.description")}
            selected={theme === "dark"}
            onClick={() => setTheme("dark")}
            preview={<ThemePreview mode="dark" />}
          />
        </div>
      </div>

      <SettingsDivider />

      <div className="space-y-4">
        <SettingsRow
          title={t("general.typography.fontFamily")}
          description={t("general.typography.fontFamilyDescription")}
          className="border-t-0 pt-0"
          action={
            <div className="w-64">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {typeof fontFamily === 'string' ? (
                      Object.prototype.hasOwnProperty.call({
                        inter: "Inter",
                        system: t("general.typography.options.system.label"),
                        jetbrains: "JetBrains",
                        lexend: "Lexend",
                        xiawu: t("general.typography.options.xiawu.label"),
                      }, fontFamily)
                        ? (
                          {
                            inter: "Inter",
                            system: t("general.typography.options.system.label"),
                            jetbrains: "JetBrains",
                            lexend: "Lexend",
                            xiawu: t("general.typography.options.xiawu.label"),
                          } as Record<string, string>
                        )[fontFamily]
                        : fontFamily
                    ) : "Inter"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                  <Command>
                    <CommandInput
                      placeholder={t("general.typography.searchFont")}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>{t("general.typography.noFontFound")}</CommandEmpty>
                      <CommandGroup>
                        {systemFonts
                          .filter(font =>
                            font.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 50) // Limit to 50 for performance
                          .map(font => {
                            const displayName = Object.prototype.hasOwnProperty.call({
                              inter: "Inter",
                              system: t("general.typography.options.system.label"),
                              jetbrains: "JetBrains",
                              lexend: "Lexend",
                              xiawu: t("general.typography.options.xiawu.label"),
                            }, font)
                              ? (
                                {
                                  inter: "Inter",
                                  system: t("general.typography.options.system.label"),
                                  jetbrains: "JetBrains",
                                  lexend: "Lexend",
                                  xiawu: t("general.typography.options.xiawu.label"),
                                } as Record<string, string>
                              )[font]
                              : font;
                            return (
                              <CommandItem
                                key={font}
                                value={font}
                                onSelect={(currentValue) => {
                                  // Map display name back to our preset keys
                                  const actualValue =
                                    currentValue === t("general.typography.options.system.label")
                                      ? "system"
                                      : currentValue === t("general.typography.options.xiawu.label")
                                        ? "xiawu"
                                        : currentValue === "Inter"
                                          ? "inter"
                                          : currentValue === "JetBrains"
                                            ? "jetbrains"
                                            : currentValue === "Lexend"
                                              ? "lexend"
                                              : currentValue;
                                  setFontFamily(actualValue);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    fontFamily === font ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {displayName}
                              </CommandItem>
                            );
                          })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          }
        />

        <div className="px-1">
          <FontPreview
            font={
              fontFamily === "inter"
                ? '"Inter", sans-serif'
                : fontFamily === "system"
                  ? 'system-ui, -apple-system, sans-serif'
                  : fontFamily === "jetbrains"
                    ? '"JetBrains Sans", sans-serif'
                    : fontFamily === "lexend"
                      ? '"Lexend Deca", sans-serif'
                      : '"霞鹜文楷等宽", "LXGW WenKai Mono", sans-serif'
            }
            label={
              fontFamily === "inter"
                ? "Inter"
                : fontFamily === "system"
                  ? t("general.typography.options.system.label")
                  : fontFamily === "jetbrains"
                    ? "JetBrains"
                    : fontFamily === "lexend"
                      ? "Lexend"
                      : t("general.typography.options.xiawu.label")
            }
          />
        </div>

        <SettingsRow
          title={t("general.typography.fontSize")}
          description={`${t("general.typography.fontSizeDescription")} ${fontSizeScale}%`}
          className="border-t-0 pt-0"
          action={
            <div className="w-48">
              <Slider
                min={90}
                max={300}
                step={5}
                value={[fontSizeScale]}
                onValueChange={(values: number[]) => setFontSizeScale(values[0])}
              />
            </div>
          }
        />

        <SettingsRow
          title={t("general.typography.uiScale")}
          description={`${t("general.typography.uiScaleDescription")} ${uiScale}%`}
          className="border-t-0 pt-0"
          action={
            <div className="w-48">
              <Slider
                min={70}
                max={200}
                step={5}
                value={[uiScale]}
                onValueChange={(values: number[]) => setUiScale(values[0])}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
