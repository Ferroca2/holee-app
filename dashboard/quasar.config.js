/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js


const { configure } = require('quasar/wrappers');
const path = require('path');

module.exports = configure(function (ctx) {
    const HOSTNAME = (() => {
        if (ctx.prod)
            return 'https://holee-app.web.app';

        const nets = require('os').networkInterfaces();

        const [externalNet] = Object
            .values(nets)
            .flat()
            .filter(net => net.family === 'IPv4' && !net.internal)
            .map(net => net.address);

        if (ctx.mode.capacitor)
            return `http://${externalNet}`;


        return 'http://127.0.0.1';
    })();

    const ORIGIN = ctx.prod ? HOSTNAME : `${HOSTNAME}:8080`;

    return {

        eslint: {
            // fix: true,
            // include: [],
            // exclude: [],
            // rawOptions: {},
            warnings: true,
            errors: true,
        },

        // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
        preFetch: true,

        // app boot file (/src/boot)
        // --> boot files are part of "main.js"
        // https://v2.quasar.dev/quasar-cli-vite/boot-files
        boot: [
            'firebase',
            ...ctx.dev ? ['firebase/emulators'] : [],
            'router-guards',
            'axios',
        ],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
        css: [
            'app.scss',
        ],

        // https://github.com/quasarframework/quasar/tree/dev/extras
        extras: [
            // 'ionicons-v4',
            // 'mdi-v5',
            // 'fontawesome-v6',
            // 'eva-icons',
            // 'themify',
            // 'line-awesome',
            // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

            'roboto-font', // optional, you are not bound to it
            'material-icons', // optional, you are not bound to it
            'material-icons-outlined', // adding outlined icons
        ],

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
        build: {
            env: {
                HOSTNAME,
                ORIGIN,
            },
            target: {
                browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
                node: 'node16',
            },

            vueRouterMode: 'history', // available values: 'hash', 'history'
            extendViteConf(config) {
                const { alias } = config.resolve;

                for (const key in alias) {
                    /**@type {string} */
                    const val = alias[key];

                    if (val.includes('src-capacitor')) {
                        delete config.resolve.alias[key];
                    }
                }

                config.resolve.alias = {
                    ...alias,
                    utils: path.resolve(__dirname, 'src/utils/'),
                    hooks: path.resolve(__dirname, 'src/hooks/'),
                };
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        'jspdf': ['jspdf', 'jspdf-autotable'],
                    },
                },
            },

            // Add optimization configuration
            optimizeDeps: {
                include: ['jspdf', 'jspdf-autotable'],
            },
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
        devServer: {
            https: false,
            port: 8080,
            open: true,
            proxy: {
                '/api': `${HOSTNAME}:5001`,
            },
        },

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
        framework: {
            config: {
                dark: 'auto',
            },

            // iconSet: 'material-icons', // Quasar icon set
            // lang: 'en-US', // Quasar language pack

            // For special cases outside of where the auto-import strategy can have an impact
            // (like functional components as one of the examples),
            // you can manually specify Quasar components/directives to be available everywhere:
            //
            // components: [],
            // directives: [],

            // Quasar plugins
            plugins: [
                'Notify',
                'Dialog',
            ],
        },

        // animations: 'all', // --- includes all animations
        // https://v2.quasar.dev/options/animations
        animations: [],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
        // sourceFiles: {
        //   rootComponent: 'src/App.vue',
        //   router: 'src/router/index',
        //   store: 'src/store/index',
        //   registerServiceWorker: 'src-pwa/register-service-worker',
        //   serviceWorker: 'src-pwa/custom-service-worker',
        //   pwaManifestFile: 'src-pwa/manifest.json',
        //   electronMain: 'src-electron/electron-main',
        //   electronPreload: 'src-electron/electron-preload'
        // },

        // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
        ssr: {
            // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
            // will mess up SSR

            // extendSSRWebserverConf (esbuildConf) {},
            // extendPackageJson (json) {},

            pwa: false,

            // manualStoreHydration: true,
            // manualPostHydrationTrigger: true,

            prodPort: 3000, // The default port that the production server should use
            // (gets superseded if process.env.PORT is specified at runtime)

            middlewares: [
                'render', // keep this as last one
            ],
        },

        // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
        pwa: {
            workboxMode: 'generateSW', // or 'injectManifest'
            injectPwaMetaTags: true,
            swFilename: 'sw.js',
            manifestFilename: 'manifest.json',
            useCredentialsForManifestTag: false,
            // useFilenameHashes: true,
            // extendGenerateSWOptions (cfg) {}
            // extendInjectManifestOptions (cfg) {},
            // extendManifestJson (json) {}
            // extendPWACustomSWConf (esbuildConf) {}
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
        cordova: {
            // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
        capacitor: {
            hideSplashscreen: false,
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
        electron: {
            // extendElectronMainConf (esbuildConf)
            // extendElectronPreloadConf (esbuildConf)

            inspectPort: 5858,

            bundler: 'packager', // 'packager' or 'builder'

            packager: {
                // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

                // OS X / Mac App Store
                // appBundleId: '',
                // appCategoryType: '',
                // osxSign: '',
                // protocol: 'myapp://path',

                // Windows only
                // win32metadata: { ... }
            },

            builder: {
                // https://www.electron.build/configuration/configuration

                appId: 'dionisio-crm',
            },
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
        bex: {
            contentScripts: [
                'my-content-script',
            ],

            // extendBexScriptsConf (esbuildConf) {}
            // extendBexManifestJson (json) {}
        },
    };
});
