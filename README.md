# BuildExpoApk

It is a tool i made to build an Expo APK locally, without using the cloud service and avoiding to wait even hours in the queue to build just a test APK.

## Before Building
In order to use it you need to have:
  1) an expo account 
  2) python3, nodejs and npm installed
  3) the expo-cli and turtle-cli packages installed globally from npm
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
  	"PUBLIC_URL": "",
	"EXPO_ANDROID_KEYSTORE_PASSWORD": "",
	"EXPO_ANDROID_KEY_PASSWORD": "",
	"KEYSTORE_ALIAS": "",
	"KEYSTORE_PATH": "",
	"EXPO_PASSWORD": "",
	"EXPO_USERNAME": ""
}
````

To build the APK, a server will be launched using python3 http.server module, listening on port 8000. This is the default behaviour if you don't populate the PUBLIC_URL field, otherwise the code will trust whatever you used as a public url to be well configured and waiting for connections. Remember that the PUBLIC_URL will be the default endpoint that your app will try to contact to check for new updates, so if it is a local address it will be hard to load updates directly in the APK without rebuilding everything.

## How to build

**IMPORTANT** The code now works using the manifest link you get after running:
````
$ expo publish
````
which looks something like `https://exp.host/@yourusername/yourappname/index.exp?sdkVersion=x.y.z`. In this way you can update your standalone app just by running `expo publish` again and closing and opening again the app 2 times (for android, just one for ios). It is maybe the raccomended way as it avoid to export everything again and you dont need to launch any deployment server etc.

If you don't want to rely on expo in any way you can go on reading the chapter.

**N.B** Now there is no need as i've found the flag `--allow-non-https-public-url`, but if you run into some trouble because of the http url read the following chapter

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
Then you just need to launch
````
$ node buildApk.js
````
The generated APK will be in the './build' folder

## After Building (only if you didn't use a custom public_url in the expo_data.json)
Once the APK is builded, the first run of the app must have the http python server listening, as the app needs to download assets like images or custom fonts. Of course if there are no assets you can skip this passage, otherwise you just need to launch
````
$ python3 -m http.server 8000
````
from the './dist' folder created by the building process


## Troubleshooting:
* You may need to setup the android SDK for turtle. You can launch `$ turtle setup:android (--sdk-version X.Y.Z //optional)` to set it up, or run the script and turtle will do it automatically.
* Expo, turtle etc. don't work well with node >= 15 (even the installation may be buggy), so use version manager like "n" to downgrade at least to a 14.x.x version, and reinstall them.
* Running the code from sudo/root is much simpler than managing permissions, but it may create folders and files which will then need root access to be accessed, giving some headaches to the people who are, rightfully, trying to avoid to simply run everything as sudo. Try to avoid root/sudo as much as possible.

