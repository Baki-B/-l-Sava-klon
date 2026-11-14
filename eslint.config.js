// ESLint yapılandırması (flat config, ESLint 9).
// Amaç: koddaki GERÇEK hataları yakalamak — tanımsız değişken, kullanılmayan kod,
// yanlış React kancası (hook) bağımlılıkları. Biçim/girinti işini Prettier yapar,
// o yüzden biçim kuralları eslint-config-prettier ile kapatılır (çakışma olmasın).
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    // Denetim dışı: bağımlılıklar, üretilmiş veri, önizleme çıktıları, derleme klasörleri.
    ignores: [
      'node_modules/**',
      'veri/**',
      'onizleme/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'web-build/**',
    ],
  },
  ...expoConfig,
  prettier,
  {
    // Node.js betikleri (scripts/ hazırlama, testler/ testler) — React/tarayıcı değil, Node ortamı.
    // src/oyun/veri.js de burada: JSON'u hem Metro hem Node okuyabilsin diye CommonJS yazıldı.
    files: [
      'scripts/**/*.js',
      'testler/**/*.js',
      'src/oyun/veri.js',
      'eslint.config.js',
      'babel.config.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    // Kullanılmayan değişken = hata değil uyarı (kontrolü durdurmasın ama gözüksün).
    // catch(e) içinde hata kullanılmaması zararsız → sayma. _ ile başlayanlar bilerek kullanılmaz.
    rules: {
      'no-unused-vars': ['warn', { caughtErrors: 'none', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
