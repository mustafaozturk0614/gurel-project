# Gürel Yönetim - Tema Sistemi Dokümantasyonu

## İçindekiler
1. [Geliştiriciler için API Rehberi](#geliştiriciler-için-api-rehberi)
   - [Tema Yöneticisi Sınıfı](#tema-yöneticisi-sınıfı)
   - [Yapılandırma Seçenekleri](#yapılandırma-seçenekleri)
   - [Olaylar ve Dinleyiciler](#olaylar-ve-dinleyiciler)
   - [Tema API Metodları](#tema-api-metodları)
   - [CSS Değişkenleri](#css-değişkenleri)
   - [Özel Temaların Entegrasyonu](#özel-temaların-entegrasyonu)
2. [Kullanıcılar için Yardım İpuçları](#kullanıcılar-için-yardım-i̇puçları)
   - [Tema Nasıl Değiştirilir?](#tema-nasıl-değiştirilir)
   - [Renk Temaları](#renk-temaları)
   - [Font Boyutu Ayarı](#font-boyutu-ayarı)
   - [Erişilebilirlik Ayarları](#erişilebilirlik-ayarları)
   - [Özel Tema Kaydetme](#özel-tema-kaydetme)
   - [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## Geliştiriciler için API Rehberi

### Tema Yöneticisi Sınıfı

Tema sistemi, `ThemeManager` sınıfı kullanılarak yönetilir. Bu sınıf, kullanıcı tema tercihlerini yönetir, localStorage'a kaydeder ve HTML elementlerine uygular.

#### Temel Kullanım

```javascript
// Tema yöneticisini varsayılan ayarlarla başlatma
const themeManager = new ThemeManager();

// Özel ayarlarla başlatma
const themeManager = new ThemeManager({
  theme: 'dark',
  colorTheme: 'green',
  useSystemPreferences: true,
  followSystemChanges: true
});
```

### Yapılandırma Seçenekleri

Tema yöneticisi aşağıdaki yapılandırma seçeneklerini destekler:

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| `theme` | string | 'light' | Başlangıç tema modu ('light', 'dark', 'highContrast') |
| `colorTheme` | string | 'blue' | Başlangıç renk teması ('blue', 'red', 'green', 'orange', 'purple') |
| `fontSize` | string | 'normal' | Başlangıç font boyutu ('small', 'normal', 'large') |
| `animations` | boolean | true | Animasyonların etkin olup olmadığı |
| `useSystemPreferences` | boolean | true | Sistem tercihlerini kullanıp kullanmama |
| `followSystemChanges` | boolean | true | Sistem değişikliklerini otomatik takip etme |
| `autoSave` | boolean | true | Değişikliklerin otomatik kaydedilip kaydedilmeyeceği |
| `debug` | boolean | false | Konsola hata ayıklama bilgilerinin yazılıp yazılmayacağı |

### Olaylar ve Dinleyiciler

ThemeManager sınıfı, tema değişiklikleri ve diğer olaylar için olay dinleyicileri sunar:

```javascript
// Tema değiştiğinde olay dinleyici ekleme
themeManager.on('themeChanged', (settings) => {
  console.log('Tema değişti:', settings);
});

// Sistem teması değiştiğinde olay dinleyici ekleme
themeManager.on('systemThemeChanged', (data) => {
  console.log('Sistem teması değişti:', data);
});

// Olay dinleyici kaldırma
themeManager.off('themeChanged', callback);
```

#### Kullanılabilir Olaylar

| Olay Adı | Tetiklenme Durumu | Veri |
|----------|-------------------|------|
| `themeChanged` | Tema modu değiştiğinde | Güncel tema ayarları |
| `colorThemeChanged` | Renk teması değiştiğinde | Güncel tema ayarları |
| `fontSizeChanged` | Font boyutu değiştiğinde | Güncel tema ayarları |
| `animationsChanged` | Animasyon durumu değiştiğinde | Güncel tema ayarları |
| `settingsSaved` | Ayarlar kaydedildiğinde | Güncel tema ayarları |
| `settingsReset` | Ayarlar sıfırlandığında | Güncel tema ayarları |
| `customThemeSaved` | Özel tema kaydedildiğinde | Kaydedilen özel tema |
| `customThemeApplied` | Özel tema uygulandığında | Uygulanan özel tema |
| `customThemeDeleted` | Özel tema silindiğinde | Silinen tema adı |
| `systemThemeChanged` | Sistem teması değiştiğinde | Yeni tema bilgisi |
| `systemReducedMotionChanged` | Sistem animasyon tercihi değiştiğinde | Yeni animasyon bilgisi |
| `themeApplied` | Tema uygulandığında | Güncel tema ayarları |
| `destroyed` | Tema yöneticisi temizlendiğinde | - |

### Tema API Metodları

ThemeManager sınıfı, tema değişiklikleri için aşağıdaki metodları sunar:

```javascript
// Tema modunu değiştirme
themeManager.setTheme('dark');        // 'light', 'dark', 'highContrast'

// Renk temasını değiştirme
themeManager.setColorTheme('green');  // 'blue', 'red', 'green', 'orange', 'purple'

// Font boyutunu değiştirme
themeManager.setFontSize('large');    // 'small', 'normal', 'large'

// Animasyonları açma/kapatma
themeManager.setAnimations(false);    // true, false

// Özel tema kaydetme
themeManager.saveCustomTheme('KişiselTemam');

// Özel temayı uygulama
themeManager.applyCustomTheme('KişiselTemam');

// Özel temayı silme
themeManager.deleteCustomTheme('KişiselTemam');

// Tüm özel temaları getirme
const temalar = themeManager.getCustomThemes();

// Sistem tercihlerini alma
const sistemTercihleri = themeManager.getSystemPreferences();

// Ayarları varsayılanlara sıfırlama
themeManager.resetToDefaults();

// Tema yöneticisini temizleme (sayfa kapanmadan önce)
themeManager.destroy();
```

### CSS Değişkenleri

Tema sistemi, aşağıdaki CSS değişkenlerini kullanır ve bunlar doğrudan HTML elementlerine veri özellikleri (data attributes) olarak uygulanır:

#### HTML data özellikleri

```html
<html data-theme="dark" data-color-theme="blue" data-font-size="large" data-reduced-motion="false">
```

#### Kullanılan CSS Değişkenleri

```css
/* Tema renkleri */
--primary-color: #0055a4;       /* Ana tema rengi */
--primary-light: #4286c5;       /* Açık tonu */
--primary-dark: #003c80;        /* Koyu tonu */
--secondary-color: #ea8600;     /* İkincil renk */
--text-color: #333333;          /* Metin rengi */
--background-color: #ffffff;    /* Arka plan rengi */
--border-color: #dddddd;        /* Kenarlık rengi */
--accent-color: #ff4081;        /* Vurgu rengi */
--success-color: #28a745;       /* Başarı mesajları rengi */
--warning-color: #ffc107;       /* Uyarı mesajları rengi */
--error-color: #dc3545;         /* Hata mesajları rengi */
--info-color: #17a2b8;          /* Bilgi mesajları rengi */
```

### Özel Temaların Entegrasyonu

Kendi uygulamanıza özel temaları entegre etmek için:

```javascript
// Özel tema oluşturma
const myCustomTheme = {
  name: 'ÖzelTemam',
  theme: 'dark',
  colorTheme: 'purple',
  fontSize: 'large'
};

// Tüm özel temaları al
const customThemes = themeManager.getCustomThemes();

// Özel tema ekle
localStorage.setItem('customThemes', JSON.stringify({
  ...customThemes,
  [myCustomTheme.name]: myCustomTheme
}));

// Tema ekledikten sonra tema yöneticisini güncellemek için
themeManager.applyCustomTheme('ÖzelTemam');
```

## CSS Theme Sınıfları

Tema sistemi, doğrudan CSS sınıflarını kullanarak stillendirme yapmak isteyenler için aşağıdaki sınıfları da sağlar:

```css
/* Body'de yer alan sınıflar */
.light-mode {}      /* Açık tema */
.dark-mode {}       /* Koyu tema */
.high-contrast {}   /* Yüksek kontrast */

/* Metin içeren elementlerde */
.text-small {}      /* Küçük metin */
.text-normal {}     /* Normal metin */
.text-large {}      /* Büyük metin */
```

---

## Kullanıcılar için Yardım İpuçları

### Tema Nasıl Değiştirilir?

1. Sayfanın sağ üst köşesindeki "Ayarlar" simgesine tıklayın.
2. Tema Seçenekleri bölümünde istediğiniz tema modunu seçin:
   - **Açık Tema**: Beyaz arka plana sahip, gündüz kullanımı için uygun tema.
   - **Koyu Tema**: Siyah arka plana sahip, gece kullanımı ve göz yorgunluğunu azaltmak için uygun tema.
   - **Yüksek Kontrast**: Görsel engelli kullanıcılar için daha yüksek kontrast sağlayan tema.

### Renk Temaları

Uygulamanın ana renklerini değiştirmek için:

1. Ayarlar panelindeki "Renk Teması" bölümüne gidin.
2. Beş farklı renk temasından birini seçin:
   - **Mavi**: Kurumsal ve profesyonel görünüm.
   - **Yeşil**: Doğa dostu ve sakin bir tema.
   - **Turuncu**: Enerjik ve dikkat çekici bir tema.
   - **Mor**: Yaratıcı ve modern bir tema.
   - **Kırmızı**: Güçlü ve dinamik bir tema.

### Font Boyutu Ayarı

Metin boyutlarını değiştirmek için:

1. Ayarlar panelindeki "Font Boyutu" bölümüne gidin.
2. Boyut seçeneklerinden birini seçin:
   - **Küçük**: Daha fazla içeriği ekrana sığdırmak için.
   - **Normal**: Standart okuma boyutu.
   - **Büyük**: Görme zorluğu yaşayanlar veya daha rahat okuma için.

### Erişilebilirlik Ayarları

Erişilebilirlik seçeneklerini yapılandırmak için:

1. Ayarlar panelindeki "Erişilebilirlik" bölümüne gidin.
2. Şu seçenekleri yapılandırabilirsiniz:
   - **Animasyonları Azalt**: Animasyonları azaltarak ekrandaki hareket miktarını azaltır.
   - **Yüksek Kontrast Modu**: WCAG standartlarına uygun kontrast oranları sağlar.
   - **Tarayıcı/Sistem Tercihlerini Kullan**: İşletim sisteminizin tema tercihlerini otomatik olarak uygular.

### Özel Tema Kaydetme

Kendi özelleştirilmiş temanızı kaydetmek için:

1. Tema, renk ve font ayarlarını istediğiniz şekilde yapılandırın.
2. Ayarlar panelinin alt kısmındaki "Temayı Kaydet" düğmesine tıklayın.
3. Temanıza bir isim verin ve "Kaydet" düğmesine tıklayın.
4. Kaydedilen temalarınızı "Kaydedilmiş Temalar" bölümünde görebilirsiniz.

### Sık Sorulan Sorular

**S: Tema tercihlerim her ziyaretimde kaydediliyor mu?**  
E: Evet, tema tercihleriniz tarayıcınızın yerel depolama alanında saklanır ve her ziyaretinizde otomatik olarak uygulanır.

**S: Temayı değiştirdiğimde neden sayfanın bazı kısımları hemen güncellenmedi?**  
E: Bazı durumlarda, sayfa tamamen yenilenene kadar tema değişiklikleri tam olarak uygulanamayabilir. Sayfayı yenilemek bu sorunu çözecektir.

**S: Tarayıcımın/işletim sistemimin tema tercihlerini nasıl takip edebilirim?**  
E: Ayarlar panelindeki "Tarayıcı/Sistem Tercihlerini Kullan" seçeneğini etkinleştirin. Bu, işletim sisteminizin tema tercihlerini (açık/koyu) otomatik olarak uygulamanıza olanak tanır.

**S: Erişilebilirlik seçenekleri neden önemlidir?**  
E: Erişilebilirlik seçenekleri, görme zorlukları, hareket hassasiyeti veya diğer engellerle karşılaşan kullanıcılar için siteyi daha erişilebilir hale getirir. Bu, herkes için daha iyi bir kullanıcı deneyimi sağlar.

**S: Özel temamı silebilir miyim?**  
E: Evet, "Kaydedilmiş Temalar" bölümünde, silmek istediğiniz temanın yanındaki "Sil" simgesine tıklayabilirsiniz.

**S: Sistem teması değiştiğinde uygulama teması otomatik olarak değişir mi?**  
E: "Tarayıcı/Sistem Tercihlerini Kullan" ve "Sistem Değişikliklerini Takip Et" seçenekleri etkinleştirildiğinde, işletim sisteminizin tema tercihleri değiştiğinde uygulama teması da otomatik olarak değişecektir. 