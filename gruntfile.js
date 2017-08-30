const {resolve} = require('path');
const {writeFileSync} = require('fs');

module.exports = function(grunt) {
    const sourceTemplatePath = grunt.option('src-cf') || resolve(__dirname, 'cform', 'lambda-optimizer.template.json');
    const templateOutPath = grunt.option('out-cf') || resolve(__dirname, 'lambda-optimizer.json');
    const priceClasses = require(grunt.option('price-classes') || resolve(__dirname, 'src', 'price-classes.json'));

    const nodeBin = bin => resolve(
        __dirname,
        'node_modules',
        '.bin',
        `${bin}${process.platform == 'win32' ? '.cmd': ''}`
    );

    const functions = [
        'average-duration',
        'cleanup',
        'decrement-repetitions',
        'initialize',
        'lambda-executor',
        'multiply-with-price',
        'sum-duration',
        'filter-result',
        'sort-results',
    ].map(n => `lambda-optimizer-${n}`);

    const zipConfig = (functionName) => ({[`dist/${functionName}.zip`]: [`dist/${functionName}.js`]});

    grunt.initConfig({
        run: {
            build: {
                cmd: nodeBin('tsc')
            }
        },
        zip: functions.reduce((conf, name) => Object.assign(conf, zipConfig(name)), {}),
        clean: {
            all_zip: ['dist/*.zip'],
            all: ['dist/*']
        }
    });

    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-clean');
    
    grunt.registerTask('build', ['clean:all', 'run:build']);
    grunt.registerTask('package', ['clean:all', 'run:build', 'zip']);
    grunt.registerTask('template', ['package', 'generate-template']);

    grunt.registerTask('generate-template', () => {
        const template = require(sourceTemplatePath);
        const {generateTemplate} = require(resolve(__dirname, 'dist', 'util', 'generate-template.js'));
        const resultTemplate = JSON.stringify(generateTemplate(template, priceClasses));
        writeFileSync(templateOutPath, resultTemplate);
    });
};