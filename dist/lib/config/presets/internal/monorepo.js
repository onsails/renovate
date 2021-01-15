"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.presets = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const repoGroups = {
    'ag-grid': 'https://github.com/ag-grid/ag-grid',
    'arcus event-grid': 'https://github.com/arcus-azure/arcus.eventgrid',
    'arcus security': 'https://github.com/arcus-azure/arcus.security',
    'arcus messaging': 'https://github.com/arcus-azure/arcus.messaging',
    'arcus observability': 'https://github.com/arcus-azure/arcus.observability',
    'arcus webapi': 'https://github.com/arcus-azure/arcus.webapi',
    'arcus background-jobs': 'https://github.com/arcus-azure/arcus.backgroundjobs',
    'algolia-react-instantsearch': 'https://github.com/algolia/react-instantsearch',
    'apollo-server': 'https://github.com/apollographql/apollo-server',
    'aspnet AspNetWebStack': 'https://github.com/aspnet/AspNetWebStack',
    'aspnet Extensions': 'https://github.com/aspnet/Extensions',
    'aws-cdk': 'https://github.com/aws/aws-cdk',
    'aws-sdk-js-v3': 'https://github.com/aws/aws-sdk-js-v3',
    'azure azure-libraries-for-net': 'https://github.com/Azure/azure-libraries-for-net',
    'azure azure-sdk-for-net': 'https://github.com/Azure/azure-sdk-for-net',
    'azure azure-storage-net': 'https://github.com/Azure/azure-storage-net',
    'bugsnag-js': 'https://github.com/bugsnag/bugsnag-js',
    'date-io': 'https://github.com/dmtrKovalenko/date-io',
    'devextreme-reactive': 'https://github.com/DevExpress/devextreme-reactive',
    'electron-forge': 'https://github.com/electron-userland/electron-forge',
    'feathers-databases': 'https://github.com/feathersjs/databases',
    'ember-decorators': 'https://github.com/ember-decorators/ember-decorators',
    'graphql-modules': 'https://github.com/Urigo/graphql-modules',
    'ionic-native': 'https://github.com/ionic-team/ionic-native',
    'mdc-react': 'material-components/material-components-web-react',
    'ngx-formly': 'https://github.com/ngx-formly/ngx-formly',
    'ngxs-store': 'https://github.com/ngxs/store',
    'reach-ui': 'https://github.com/reach/reach-ui',
    'react-apollo': 'https://github.com/apollographql/react-apollo',
    'react-dnd': 'https://github.com/react-dnd/react-dnd',
    'react-navigation': 'https://github.com/react-navigation/react-navigation',
    'reactivestack-cookies': 'https://github.com/reactivestack/cookies',
    'reg-suit': 'https://github.com/reg-viz/reg-suit',
    'semantic-release': 'https://github.com/semantic-release/',
    'telus-tds': 'https://github.com/telusdigital/tds',
    'typescript-eslint': 'https://github.com/typescript-eslint/typescript-eslint',
    'typography-js': 'https://github.com/KyleAMathews/typography.js',
    'vue-cli': 'https://github.com/vuejs/vue-cli',
    accounts: 'https://github.com/accounts-js/accounts',
    angular1: 'https://github.com/angular/angular.js',
    angular: 'https://github.com/angular/angular',
    angularcli: 'https://github.com/angular/angular-cli',
    angularfire: 'https://github.com/angular/angularfire',
    apolloclient: 'https://github.com/apollographql/apollo-client',
    apollolink: 'https://github.com/apollographql/apollo-link',
    awsappsync: 'https://github.com/awslabs/aws-mobile-appsync-sdk-js',
    babel: 'https://github.com/babel/babel',
    baset: 'https://github.com/igmat/baset',
    brave: 'https://github.com/openzipkin/brave',
    capacitor: 'https://github.com/ionic-team/capacitor',
    chromely: 'https://github.com/chromelyapps/Chromely',
    clarity: 'https://github.com/vmware/clarity',
    commitlint: 'https://github.com/conventional-changelog/commitlint',
    docusaurus: 'https://github.com/facebook/docusaurus',
    dropwizard: 'https://github.com/dropwizard/dropwizard',
    emotion: 'https://github.com/emotion-js/emotion',
    expo: 'https://github.com/expo/expo',
    feathers: 'https://github.com/feathersjs/feathers',
    fimbullinter: 'https://github.com/fimbullinter/wotan',
    flopflip: 'https://github.com/tdeekens/flopflip',
    formatjs: 'https://github.com/formatjs/formatjs',
    framework7: 'https://github.com/framework7io/framework7',
    gatsby: 'https://github.com/gatsbyjs/gatsby',
    graphqlcodegenerator: [
        'https://github.com/dotansimha/graphql-code-generator',
        'https://github.com/dotansimha/graphql-codegen',
    ],
    'graphql-mesh': 'https://github.com/Urigo/graphql-mesh',
    'graphql-toolkit': 'https://github.com/ardatan/graphql-toolkit',
    'graphql-tools': 'https://github.com/ardatan/graphql-tools',
    hamcrest: 'https://github.com/hamcrest/JavaHamcrest',
    hapijs: 'https://github.com/hapijs',
    infrastructure: 'https://github.com/instructure/instructure-ui',
    istanbuljs: 'https://github.com/istanbuljs/istanbuljs',
    jasmine: 'https://github.com/jasmine/jasmine',
    jersey: 'https://github.com/eclipse-ee4j/jersey',
    jest: 'https://github.com/facebook/jest',
    lerna: 'https://github.com/lerna/lerna',
    lingui: 'https://github.com/lingui/js-lingui',
    lodash: 'https://github.com/lodash/',
    loopback: 'https://github.com/strongloop/loopback-next',
    lrnwebcomponents: 'https://github.com/elmsln/lrnwebcomponents',
    material: 'https://github.com/material-components/material-components-web',
    mdx: 'https://github.com/mdx-js/mdx',
    mui: 'https://github.com/mui-org/material-ui',
    nest: 'https://github.com/nestjs/nest',
    neutrino: [
        'https://github.com/neutrinojs/neutrino',
        'https://github.com/mozilla-neutrino/neutrino-dev',
    ],
    nextjs: [
        'https://github.com/zeit/next.js',
        'https://github.com/vercel/next.js',
    ],
    nivo: 'https://github.com/plouc/nivo',
    ngrx: 'https://github.com/ngrx/',
    nrwl: 'https://github.com/nrwl/',
    nuxtjs: 'https://github.com/nuxt/nuxt.js',
    openfeign: 'https://github.com/OpenFeign/feign',
    opentelemetry: 'https://github.com/open-telemetry/opentelemetry-js',
    picasso: 'https://github.com/qlik-oss/picasso.js',
    pollyjs: 'https://github.com/Netflix/pollyjs',
    pouchdb: 'https://github.com/pouchdb/pouchdb',
    prisma: 'https://github.com/prisma/prisma',
    react: 'https://github.com/facebook/react',
    reactrouter: 'https://github.com/ReactTraining/react-router',
    reakit: 'https://github.com/reakit/reakit',
    remark: 'https://github.com/remarkjs/remark',
    router5: 'https://github.com/router5/router5',
    sentry: 'https://github.com/getsentry/sentry-javascript',
    springfox: 'https://github.com/springfox/springfox',
    sanity: 'https://github.com/sanity-io/sanity',
    storybook: 'https://github.com/storybookjs/storybook',
    strapi: 'https://github.com/strapi/strapi',
    stryker: 'https://github.com/stryker-mutator/stryker',
    surveyjs: 'https://github.com/surveyjs/surveyjs',
    Swashbuckle: 'https://github.com/domaindrivendev/Swashbuckle.AspNetCore',
    treat: 'https://github.com/seek-oss/treat',
    typefaces: 'https://github.com/KyleAMathews/typefaces',
    uppy: 'https://github.com/transloadit/uppy',
    vue: 'https://github.com/vuejs/vue',
    vuepress: 'https://github.com/vuejs/vuepress',
    webdriverio: 'https://github.com/webdriverio/webdriverio',
    workbox: 'https://github.com/googlechrome/workbox',
};
const patternGroups = {
    babel6: '^babel6$',
    clarity: ['^@cds/', '^@clr/'],
    wordpress: '^@wordpress/',
    angularmaterial: ['^@angular/material', '^@angular/cdk'],
    'aws-java-sdk': '^com.amazonaws:aws-java-sdk-',
    embroider: '^@embroider/',
    fullcalendar: '^@fullcalendar/',
};
exports.presets = {};
for (const [name, value] of Object.entries(repoGroups)) {
    exports.presets[name] = {
        description: `${name} monorepo`,
        sourceUrlPrefixes: is_1.default.array(value) ? value : [value],
    };
}
for (const [name, value] of Object.entries(patternGroups)) {
    exports.presets[name] = {
        description: `${name} monorepo`,
        packagePatterns: is_1.default.array(value) ? value : [value],
    };
}
//# sourceMappingURL=monorepo.js.map