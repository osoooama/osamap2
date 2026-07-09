'use client';
import { useSettingsStore } from '@/stores/settings';
import { useThemeStore } from '@/stores/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">عامة</TabsTrigger>
          <TabsTrigger value="player">المشغل</TabsTrigger>
          <TabsTrigger value="advanced">متقدم</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>اللغة</CardTitle></CardHeader>
            <CardContent>
              <Select value={settings.language} onValueChange={(v) => v && settings.setLanguage(v as 'ar' | 'en')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>السمة</CardTitle></CardHeader>
            <CardContent>
              <Select value={settings.themeMode} onValueChange={(v) => v && settings.setThemeMode(v as 'light' | 'dark' | 'system')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">فاتح</SelectItem>
                  <SelectItem value="dark">غامق</SelectItem>
                  <SelectItem value="system">تلقائي</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>المؤثرات</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>المؤثرات الصوتية</span>
                <Switch checked={settings.soundEnabled} onCheckedChange={settings.toggleSound} />
              </div>
              <div className="flex items-center justify-between">
                <span>الاهتزاز (Haptics)</span>
                <Switch checked={settings.hapticsEnabled} onCheckedChange={settings.toggleHaptics} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>جودة الفيديو</CardTitle></CardHeader>
            <CardContent>
              <Select value={settings.videoQuality} onValueChange={(v) => v && settings.setVideoQuality(v as '720p' | '1080p' | '4K' | 'auto')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">تلقائي</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الترجمات</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>تفعيل الترجمة</span>
                <Switch checked={settings.subtitleEnabled} onCheckedChange={settings.toggleSubtitles} />
              </div>
              <Select value={settings.subtitleLanguage} onValueChange={(v) => v && settings.setSubtitleLanguage(v as 'ar' | 'en' | 'tr' | 'auto')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">عربي</SelectItem>
                  <SelectItem value="en">إنجليزي</SelectItem>
                  <SelectItem value="tr">تركي</SelectItem>
                  <SelectItem value="auto">تلقائي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={settings.subtitleFontSize} onValueChange={(v) => v && settings.setSubtitleFontSize(v as 'small' | 'medium' | 'large')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">صغير</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="large">كبير</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm">تأخير الترجمة: {settings.subtitleDelay}s</label>
                <Slider
                  value={settings.subtitleDelay}
                  onValueChange={(v) => settings.setSubtitleDelay(Array.isArray(v) ? v[0] : v)}
                  min={-3} max={3} step={0.5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الصوت</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={settings.audioLanguage} onValueChange={(v) => v && settings.setAudioLanguage(v as 'original' | 'dubbed')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">الأصلية</SelectItem>
                  <SelectItem value="dubbed">مدبلج</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm">مستوى الصوت: {settings.audioVolume}%</label>
                <Slider
                  value={settings.audioVolume}
                  onValueChange={(v) => settings.setAudioVolume(Array.isArray(v) ? v[0] : v)}
                  min={0} max={100} step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>التخزين المؤقت</CardTitle></CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => {
                if (confirm('هل أنت متأكد من مسح التخزين المؤقت؟')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}>مسح التخزين المؤقت</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>إعادة تعيين</CardTitle></CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => {
                if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
                  settings.resetSettings();
                  window.location.reload();
                }
              }}>إعادة تعيين الإعدادات</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
