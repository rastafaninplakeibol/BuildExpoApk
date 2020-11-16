# BuildExpoApk

It is a tool i made to build an Expo APK locally, without using the cloud service and avoiding to wait even hours in the queue to build just a test APK.

## Before Building
In order to use it you need to have:
  1) an expo account 
  2) python3, nodejs and npm installed
  3) the expo-cli and turtle-cli packages installed from npm
  4) your own keystore files fetched from the expo-cli
  
To fetch the keystore you have to launch this command from terminal: 
````
$ expo fetch:android:keystore
````
It writes keystore to PROJECT_DIR/PROJECT_NAME.jks and prints passwords to stdout. It is VERY important to save these passwords, as you need them later to fill the expo_data.json file.

You'll need to provide these informations in the json file, which will be parsed at the beginning of the process:
````
{
	"EXPO_ANDROID_KEYSTORE_PASSWORD": "",
	"EXPO_ANDROID_KEY_PASSWORD": "",
	"KEYSTORE_ALIAS": "",
	"KEYSTORE_PATH": "",
	"EXPO_PASSWORD": "",
	"EXPO_USERNAME": ""
}
````

To build the APK, a server will be launched using python3 http.server module, listening on port 8000 (you can modify the address and the port of the server in the buildApk.js file if you need it, it may be useful if you want to use a custom deployment server which can be somewhere else other than localhost).

## How to build
Just launch
````
$ node buildApk.js
````

## After Building
Once the APK is builded, the first run of the app must have the http python server listening, as the app needs to download assets like images or custom fonts. Of course if there are no assets you can skip this passage, otherwise you just need to launch
````
$ python3 -m http.server 8000
````
from the './dist' folder created by the building process
