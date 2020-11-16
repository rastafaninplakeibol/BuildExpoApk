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
which will give you an output like this:
````
Accessing credentials for USERNAME in project test-app
Saving Keystore to /path/to/your/project/test-app/test-app.jks
Keystore credentials
  Keystore password: a_long_password
  Key alias:         a_long_alias
  Key password:      another_long_password

  Path to Keystore:  /path/to/yout/project/test-app/test-app.jks
````
It writes keystore to PROJECT_DIR/PROJECT_NAME.jks and prints passwords to stdout. It is VERY important to save these passwords, as you need them later to fill the expo_data.json file.

**N.B.** 
if the command fails with `There is no valid Keystore defined for this app` you need to build them for the first time using the expo service with:
````
$ expo build:android
````
During the process, expo will take care of creating a unique keystore for your APK. You don't really need to wait for the build to be completed, you just have to tell expo to create the keystore, which is done at the beginning of the build process. 

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
Before launching the build program, there is just a little tweak on the turtle source code that must be done, because turtle does not accept HTTP custom developement endpoints, and it tells you that only HTTPS is supported, which is a little lie.

In order to avoid to get a valid, signed HTTPS certificate, you just need to go to `/usr/local/lib/node_modules/turtle-cli/build/bin/utils/builder.js` and look for:
````javascript
....
 if (cmd.publicUrl && !cmd.allowNonHttpsPublicUrl) {
       const parsedPublicUrl = url_1.default.parse(cmd.publicUrl);
       if (parsedPublicUrl.protocol !== 'https:') {
            throw new ErrorWithCommandHelp_1.ErrorWithCommandHelp('--public-url is invalid - only HTTPS urls are supported');
       }
 }
....
````
And comment out the check on https. Seems like there is a way to explicitly tells to turtle to not check for https, but i can't find a way to set that flag from command line.

Then you just need to launch
````
$ node buildApk.js
````
The generated APK should be in the './build' folder

## After Building
Once the APK is builded, the first run of the app must have the http python server listening, as the app needs to download assets like images or custom fonts. Of course if there are no assets you can skip this passage, otherwise you just need to launch
````
$ python3 -m http.server 8000
````
from the './dist' folder created by the building process


## Known Problems:
* You may need to setup the android SDK for turtle, which can be done only from root/sudo. You can launch `# turtle setup:android (--sdk-version X.Y.Z //optional)` to set it up, or run the script with sudo/root and turtle will do it automatically.

