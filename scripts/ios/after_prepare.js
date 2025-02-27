'use strict';

module.exports = function (context) {
  var fs = require('fs');
  var path = require('path');

  var cordova_util = context.requireCordovaModule('cordova-lib/src/cordova/util.js');
  var common = context.requireCordovaModule('cordova-common');
  var ConfigParser = common.ConfigParser;
  var projectRoot = context.opts.projectRoot;
  
  var configXml = cordova_util.projectConfig(projectRoot);
  var config = new ConfigParser(configXml);
  var projectName = config.name();
  
  var platformRoot = path.join(projectRoot, 'platforms/ios');
  var pluginId = context.opts.plugin.id;
  
  var defaults = {
    FACEBOOK_URL_SCHEME_SUFFIX: '',
    FACEBOOK_AUTO_LOG_APP_EVENTS: 'true',
    FACEBOOK_ADVERTISER_ID_COLLECTION: 'true'
  };
  
  
  var getPreferenceValueFromConfig = function (config, name) {
      var value = config.match(new RegExp('name="' + name + '" value="(.*?)"', "i"))
      if(value && value[1]) {
          return value[1]
      } else {
          return null
      }
  }

  var getPreferenceValueFromPackageJson = function (packageJson, name) {
      var value = packageJson.match(new RegExp('"' + name + '":\\s"(.*?)"', "i"))
      if(value && value[1]) {
          return value[1]
      } else {
          return null
      }
  }
  
  
  var getPreferenceValue = function (name) {
      var config = fs.readFileSync(configPath).toString()
      var preferenceValue = getPreferenceValueFromConfig(config, name)
      if(!preferenceValue) {
        if (fs.existsSync("package.json")) {
          var packageJson = fs.readFileSync("package.json").toString()
          preferenceValue = getPreferenceValueFromPackageJson(packageJson, name)
        }
        else {
          preferenceValue=defaults[name];
        }
      }
      return preferenceValue
  }


  var getPlistPath = function () {
	var is_cordova = cordova_util.isCordova();
	//cordova_util.projectConfig(is_cordova);
    //projectName = new common.ConfigParser(projectConfig).name(), 
    //plistPath = './platforms/ios/' + projectName + '/' + projectName + '-Info.plist'
	var plistPath = path.join(platformRoot, projectName + '/' + projectName + '-Info.plist');
    return plistPath
  }
  var getConfigPath = function () {
	var the_path = path.join(platformRoot, projectName + '/config.xml');
    return the_path;
  }
  
  
  var plistPath = getPlistPath();
  var configPath = getConfigPath();
  
  console.log('PLIST PATH: '+ plistPath);
  console.log('CONFIG PATH: '+ configPath);
  
  
  var FACEBOOK_URL_SCHEME_SUFFIX = ' '
  var FACEBOOK_AUTO_LOG_APP_EVENTS = 'true';
  var FACEBOOK_ADVERTISER_ID_COLLECTION = 'true';
  

  var updatePlistContent = function () {
	console.log('processing plist alterations..');
	if (fs.existsSync(plistPath)) {
	  var plistContent = fs.readFileSync(plistPath, 'utf8');
	  
	  console.log('plist len: '+plistContent.length);

	  plistContent = plistContent.replace(/FACEBOOK_URL_SCHEME_SUFFIX_PLACEHOLDER/g, FACEBOOK_URL_SCHEME_SUFFIX);

	  if(plistContent.indexOf('<key>FacebookAutoLogAppEventsEnabled</key>') == -1) {
		plistContent = plistContent.replace('<key>FacebookAutoLogAppEventsEnabled_PLACEHOLDER</key>', '<key>FacebookAutoLogAppEventsEnabled</key>').replace('<string>FACEBOOK_AUTO_LOG_APP_EVENTS_PLACEHOLDER</string>', '<' + FACEBOOK_AUTO_LOG_APP_EVENTS + ' />');
	  } else {
		plistContent = plistContent.replace('<key>FacebookAutoLogAppEventsEnabled_PLACEHOLDER</key>', '').replace('<string>FACEBOOK_AUTO_LOG_APP_EVENTS_PLACEHOLDER</string>', '');
	  }

	  if(plistContent.indexOf('<key>FacebookAdvertiserIDCollectionEnabled</key>') == -1) {
		plistContent = plistContent.replace('<key>FacebookAdvertiserIDCollectionEnabled_PLACEHOLDER</key>', '<key>FacebookAdvertiserIDCollectionEnabled</key>').replace('<string>FACEBOOK_ADVERTISER_ID_COLLECTION_PLACEHOLDER</string>', '<' + FACEBOOK_ADVERTISER_ID_COLLECTION + ' />');
	  } else {
		plistContent = plistContent.replace('<key>FacebookAdvertiserIDCollectionEnabled_PLACEHOLDER</key>', '').replace('<string>FACEBOOK_ADVERTISER_ID_COLLECTION_PLACEHOLDER</string>', '');
	  }

	  console.log('writing plist w/ facebook values, new len: '+plistContent.length);
	  fs.writeFileSync(plistPath, plistContent, 'utf8');
	}
  }
  
  
  
  if(process.argv.join("|").indexOf("FACEBOOK_URL_SCHEME_SUFFIX=") > -1) {
  	FACEBOOK_URL_SCHEME_SUFFIX = process.argv.join("|").match(/FACEBOOK_URL_SCHEME_SUFFIX=(.*?)(\||$)/)[1]
  } else {
  	FACEBOOK_URL_SCHEME_SUFFIX = getPreferenceValue("FACEBOOK_URL_SCHEME_SUFFIX")
  }

  if(FACEBOOK_URL_SCHEME_SUFFIX === ' ') {
    FACEBOOK_URL_SCHEME_SUFFIX = ''
  }
  
  if(process.argv.join("|").indexOf("FACEBOOK_AUTO_LOG_APP_EVENTS=") > -1) {
  	FACEBOOK_AUTO_LOG_APP_EVENTS = process.argv.join("|").match(/FACEBOOK_AUTO_LOG_APP_EVENTS=(.*?)(\||$)/)[1]
  } else {
  	FACEBOOK_AUTO_LOG_APP_EVENTS = getPreferenceValue("FACEBOOK_AUTO_LOG_APP_EVENTS")
  }
  
  if(typeof FACEBOOK_AUTO_LOG_APP_EVENTS == 'string' && FACEBOOK_AUTO_LOG_APP_EVENTS.toLowerCase() == 'false') {
    FACEBOOK_AUTO_LOG_APP_EVENTS = 'false'
  } else {
    FACEBOOK_AUTO_LOG_APP_EVENTS = 'true'
  }

  

  if(process.argv.join("|").indexOf("FACEBOOK_ADVERTISER_ID_COLLECTION=") > -1) {
    FACEBOOK_ADVERTISER_ID_COLLECTION = process.argv.join("|").match(/FACEBOOK_ADVERTISER_ID_COLLECTION=(.*?)(\||$)/)[1]
  } else {
    FACEBOOK_ADVERTISER_ID_COLLECTION = getPreferenceValue("FACEBOOK_ADVERTISER_ID_COLLECTION")
  }

  if(typeof FACEBOOK_ADVERTISER_ID_COLLECTION == 'string' && FACEBOOK_ADVERTISER_ID_COLLECTION.toLowerCase() == 'false') {
    FACEBOOK_ADVERTISER_ID_COLLECTION = 'false'
  } else {
    FACEBOOK_ADVERTISER_ID_COLLECTION = 'true'
  }

  updatePlistContent();
}